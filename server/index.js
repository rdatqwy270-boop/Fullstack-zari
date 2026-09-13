/**
 * سرور بک‌اند فروشگاه زری
 * در توسعه، Vite درخواست‌های /api را به این سرور پروکسی می‌کند،
 * بنابراین فرانت‌اند همیشه از مسیر نسبی /api استفاده می‌کند.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { db } from './db.js';
import { seedIfEmpty } from './seed.js';
import { HttpError } from './lib/http.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import newsletterRouter from './routes/newsletter.js';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);

const app = express();

app.use(express.json({ limit: '64kb' }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    methods: ['GET', 'POST'],
  })
);

/* ---------- مسیرها ---------- */
app.get('/api/health', (_req, res) => {
  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    products: Number(productCount.count),
  });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/newsletter', newsletterRouter);

/* ---------- سرویس فایل‌های تولیدشده فرانت‌اند (در صورت اجرای حالت production) ---------- */
const distDir = path.join(serverDir, '..', 'zari-luxury-store', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

/* ---------- مدیریت خطاها ---------- */
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'مسیر API یافت نشد' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({
    error: status >= 500 ? 'خطای داخلی سرور' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
});

/* ---------- راه‌اندازی ---------- */
seedIfEmpty();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] API زری روی پورت ${PORT} آماده است → http://localhost:${PORT}/api/health`);
});
