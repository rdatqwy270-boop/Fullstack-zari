/**
 * مقداردهی اولیه دیتابیس با داده‌های محصولات.
 * اجرا: npm run seed  (یا خودکار هنگام شروع سرور اگر جدول خالی باشد)
 */
import { db } from './db.js';
import { productSeed } from './seed-data.js';

export function seedProducts() {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO products
      (id, name, brand, category, price, old_price, image, image_hover,
       description, material, sizes, stock, rating, is_new, is_sale, discount)
    VALUES
      (@id, @name, @brand, @category, @price, @oldPrice, @image, @imageHover,
       @description, @material, @sizes, @stock, @rating, @isNew, @isSale, @discount)
  `);

  const insertAll = db.exec ? null : null;
  for (const p of productSeed) {
    insert.run({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      image: p.image,
      imageHover: p.imageHover ?? null,
      description: p.description ?? '',
      material: p.material ?? '',
      sizes: JSON.stringify(p.sizes ?? []),
      stock: p.stock ?? 0,
      rating: p.rating ?? 0,
      isNew: p.isNew ? 1 : 0,
      isSale: p.isSale ? 1 : 0,
      discount: p.discount ?? 0,
    });
  }
  void insertAll;
  return productSeed.length;
}

/** تنها زمانی seed می‌کند که جدول محصولات خالی باشد */
export function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (Number(row.count) === 0) {
    const count = seedProducts();
    console.log(`[seed] ${count} محصول در دیتابیس بارگذاری شد.`);
  }
}

/* اجرای مستقیم: node seed.js */
const isDirectRun = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
  const count = seedProducts();
  console.log(`[seed] ${count} محصول با موفقیت درج/به‌روزرسانی شد.`);
}
