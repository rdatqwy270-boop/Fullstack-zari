/**
 * لایه دیتابیس — SQLite از طریق ماژول داخلی نود (node:sqlite).
 * فایل دیتابیس در server/data/zari.db ساخته می‌شود و در گیت ذخیره نمی‌شود.
 */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(serverDir, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const DB_PATH = process.env.DB_PATH || path.join(dataDir, 'zari.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL,
    brand       TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    price       INTEGER NOT NULL CHECK (price >= 0),
    old_price   INTEGER,
    image       TEXT    NOT NULL,
    image_hover TEXT,
    description TEXT    NOT NULL DEFAULT '',
    material    TEXT    NOT NULL DEFAULT '',
    sizes       TEXT    NOT NULL DEFAULT '[]',
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    rating      REAL    NOT NULL DEFAULT 0,
    is_new      INTEGER NOT NULL DEFAULT 0,
    is_sale     INTEGER NOT NULL DEFAULT 0,
    discount    INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT    NOT NULL UNIQUE,
    customer    TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    email       TEXT,
    city        TEXT    NOT NULL,
    address     TEXT    NOT NULL,
    postal_code TEXT,
    note        TEXT,
    subtotal    INTEGER NOT NULL,
    shipping    INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    name       TEXT    NOT NULL,
    price      INTEGER NOT NULL,
    quantity   INTEGER NOT NULL CHECK (quantity > 0)
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

/* ---------- تبدیل ردیف دیتابیس به آبجکت محصول (camelCase) ---------- */
export function toProduct(row) {
  if (!row) return null;
  let sizes = [];
  try {
    sizes = JSON.parse(row.sizes);
  } catch {
    sizes = [];
  }
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price ?? null,
    image: row.image,
    imageHover: row.image_hover ?? null,
    description: row.description,
    material: row.material,
    sizes,
    stock: row.stock,
    rating: row.rating,
    isNew: Boolean(row.is_new),
    isSale: Boolean(row.is_sale),
    discount: row.discount,
  };
}

export function toOrder(row, items = []) {
  if (!row) return null;
  return {
    code: row.code,
    customer: row.customer,
    phone: row.phone,
    email: row.email,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    note: row.note,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    items,
  };
}
