import { Router } from 'express';
import { db, toProduct } from '../db.js';
import { asyncHandler, notFound } from '../lib/http.js';

const router = Router();

const SORT_OPTIONS = {
  newest: 'CASE WHEN p.is_new = 1 THEN 0 ELSE 1 END, p.id DESC',
  'price-asc': 'p.price ASC',
  'price-desc': 'p.price DESC',
  popular: 'p.rating DESC, p.id DESC',
};

/** GET /api/products — فهرست محصولات با فیلتر، جستجو، مرتب‌سازی و صفحه‌بندی */
router.get(
  '/',
  asyncHandler((req, res) => {
    const { category, q, sort = 'newest', page = '1', limit = '24', featured } = req.query;

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.min(48, Math.max(1, Number.parseInt(limit, 10) || 24));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = {};

    if (category && category !== 'همه' && category !== 'all') {
      where.push('p.category = @category');
      params.category = String(category);
    }
    if (q && String(q).trim()) {
      where.push('(p.name LIKE @q OR p.brand LIKE @q OR p.description LIKE @q OR p.category LIKE @q)');
      params.q = `%${String(q).trim()}%`;
    }
    if (featured === '1' || featured === 'true') {
      where.push('(p.is_new = 1 OR p.is_sale = 1)');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = SORT_OPTIONS[sort] ? SORT_OPTIONS[sort] : SORT_OPTIONS.newest;

    const rows = db
      .prepare(
        `SELECT p.* FROM products p ${whereSql} ORDER BY ${orderSql} LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: limitNum, offset });

    const totalRow = db.prepare(`SELECT COUNT(*) AS count FROM products p ${whereSql}`).get(params);
    const total = Number(totalRow.count);

    res.json({
      data: rows.map(toProduct),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pageCount: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  })
);

/** GET /api/products/categories — دسته‌بندی‌ها همراه تعداد محصول */
router.get(
  '/categories',
  asyncHandler((_req, res) => {
    const rows = db
      .prepare(
        `SELECT category AS name, COUNT(*) AS count, MIN(image) AS image
         FROM products GROUP BY category ORDER BY count DESC, name ASC`
      )
      .all();
    res.json({ data: rows });
  })
);

/** GET /api/products/:id — جزئیات یک محصول و محصولات مرتبط */
router.get(
  '/:id',
  asyncHandler((req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) throw notFound('محصول یافت نشد');

    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    const product = toProduct(row);
    if (!product) throw notFound('محصول یافت نشد');

    const related = db
      .prepare(
        `SELECT * FROM products
         WHERE category = ? AND id != ?
         ORDER BY rating DESC LIMIT 4`
      )
      .all(product.category, id)
      .map(toProduct);

    res.json({ data: { product, related } });
  })
);

export default router;
