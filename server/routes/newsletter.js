import { Router } from 'express';
import { db } from '../db.js';
import { asyncHandler } from '../lib/http.js';
import { validateEmail } from '../lib/validate.js';

const router = Router();

/** POST /api/newsletter — عضویت در خبرنامه */
router.post(
  '/',
  asyncHandler((req, res) => {
    const email = validateEmail(req.body?.email);

    const existing = db.prepare('SELECT 1 FROM subscribers WHERE email = ?').get(email);
    if (existing) {
      return res.json({ message: 'این ایمیل قبلاً عضو خبرنامه شده است' });
    }

    db.prepare('INSERT INTO subscribers (email) VALUES (?)').run(email);
    return res.status(201).json({ message: 'عضویت شما در خبرنامه با موفقیت ثبت شد' });
  })
);

/** GET /api/newsletter/count — تعداد اعضا (برای نمایش در صفحه درباره ما) */
router.get(
  '/count',
  asyncHandler((_req, res) => {
    const row = db.prepare('SELECT COUNT(*) AS count FROM subscribers').get();
    res.json({ data: { count: Number(row.count) } });
  })
);

export default router;
