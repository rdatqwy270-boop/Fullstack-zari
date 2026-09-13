import { Router } from 'express';
import { db, toOrder } from '../db.js';
import { asyncHandler, badRequest, notFound } from '../lib/http.js';
import { validateOrderPayload } from '../lib/validate.js';

const router = Router();

const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 50000);
const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD || 3000000);

/** تولید کد پیگیری خوانا، مثل ZR-8F3K2Q */
function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ZR-${code}`;
}

/**
 * POST /api/orders — ثبت سفارش
 * امنیت: قیمت و موجودی تنها از دیتابیس خوانده می‌شود؛ مبالغ ارسالی کلاینت نادیده گرفته می‌شوند.
 */
router.post(
  '/',
  asyncHandler((req, res) => {
    const payload = validateOrderPayload(req.body);

    const productStmt = db.prepare('SELECT * FROM products WHERE id = ?');

    // محاسبه اقلام بر اساس قیمت واقعی دیتابیس
    const pricedItems = [];
    for (const item of payload.items) {
      const row = productStmt.get(item.productId);
      if (!row) throw badRequest(`محصول با شناسه ${item.productId} وجود ندارد`);
      if (row.stock < item.quantity) {
        throw badRequest(`موجودی «${row.name}» کافی نیست (موجود: ${row.stock})`);
      }
      pricedItems.push({
        productId: row.id,
        name: row.name,
        price: row.price,
        quantity: item.quantity,
      });
    }

    const subtotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    let code = generateOrderCode();
    const codeExists = db.prepare('SELECT 1 FROM orders WHERE code = ?');
    while (codeExists.get(code)) code = generateOrderCode();

    let orderId;
    try {
      db.exec('BEGIN');
      const result = db
        .prepare(
          `INSERT INTO orders
             (code, customer, phone, email, city, address, postal_code, note,
              subtotal, shipping, total, status)
           VALUES
             (@code, @customer, @phone, @email, @city, @address, @postalCode, @note,
              @subtotal, @shipping, @total, 'pending')`
        )
        .run({
          code,
          customer: payload.customer,
          phone: payload.phone,
          email: payload.email,
          city: payload.city,
          address: payload.address,
          postalCode: payload.postalCode,
          note: payload.note,
          subtotal,
          shipping,
          total,
        });
      orderId = Number(result.lastInsertRowid);

      const itemStmt = db.prepare(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`
      );
      const stockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      for (const item of pricedItems) {
        itemStmt.run(orderId, item.productId, item.name, item.price, item.quantity);
        stockStmt.run(item.quantity, item.productId);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db
      .prepare('SELECT product_id, name, price, quantity FROM order_items WHERE order_id = ?')
      .all(orderId);

    res.status(201).json({
      data: toOrder(row, items),
      message: 'سفارش با موفقیت ثبت شد',
    });
  })
);

/** GET /api/orders/:code — پیگیری سفارش با کد */
router.get(
  '/:code',
  asyncHandler((req, res) => {
    const code = String(req.params.code || '').trim().toUpperCase();
    const row = db.prepare('SELECT * FROM orders WHERE code = ?').get(code);
    if (!row) throw notFound('سفارشی با این کد یافت نشد');

    const items = db
      .prepare('SELECT product_id, name, price, quantity FROM order_items WHERE order_id = ?')
      .all(row.id);

    res.json({ data: toOrder(row, items) });
  })
);

export default router;
