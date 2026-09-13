import { badRequest } from './http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+98|0)?9\d{9}$/;
const POSTAL_RE = /^\d{10}$/;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** اعتبارسنجی ایمیل (برای خبرنامه و فیلد اختیاری سفارش) */
export function validateEmail(value, { required = true, field = 'ایمیل' } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw badRequest(`${field} الزامی است`);
    return null;
  }
  const email = String(value).trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    throw badRequest(`${field} معتبر نیست`);
  }
  return email;
}

function validateString(value, field, { min = 1, max = 200, required = true } = {}) {
  if (!isNonEmptyString(value)) {
    if (required) throw badRequest(`${field} الزامی است`);
    return '';
  }
  const text = String(value).trim();
  if (text.length < min) throw badRequest(`${field} باید حداقل ${min} کاراکتر باشد`);
  if (text.length > max) throw badRequest(`${field} باید حداکثر ${max} کاراکتر باشد`);
  return text;
}

/**
 * اعتبارسنجی بدنه درخواست ثبت سفارش.
 * توجه: قیمت‌ها هرگز از کلاینت گرفته نمی‌شوند و از دیتابیس خوانده می‌شوند.
 */
export function validateOrderPayload(body) {
  if (!body || typeof body !== 'object') throw badRequest('بدنه درخواست نامعتبر است');

  const customer = validateString(body.customer, 'نام و نام خانوادگی', { min: 3, max: 80 });

  const rawPhone = String(body.phone ?? '').replace(/[\s-]/g, '');
  if (!PHONE_RE.test(rawPhone)) {
    throw badRequest('شماره موبایل معتبر نیست (نمونه: 09123456789)');
  }
  const phone = rawPhone.startsWith('0') ? rawPhone : `0${rawPhone.replace(/^\+98/, '')}`;

  const email = validateEmail(body.email, { required: false, field: 'ایمیل' });

  const city = validateString(body.city, 'شهر', { min: 2, max: 60 });
  const address = validateString(body.address, 'آدرس', { min: 10, max: 500 });

  let postalCode = '';
  if (isNonEmptyString(body.postalCode)) {
    const pc = String(body.postalCode).trim();
    if (!POSTAL_RE.test(pc)) throw badRequest('کد پستی باید ۱۰ رقم باشد');
    postalCode = pc;
  }

  const note = isNonEmptyString(body.note) ? String(body.note).trim().slice(0, 500) : '';

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw badRequest('سبد خرید خالی است');
  }
  if (body.items.length > 50) {
    throw badRequest('تعداد اقلام سبد خرید بیش از حد مجاز است');
  }

  const items = body.items.map((item, index) => {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      throw badRequest(`شناسه محصول در ردیف ${index + 1} نامعتبر است`);
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw badRequest(`تعداد محصول در ردیف ${index + 1} نامعتبر است`);
    }
    if (quantity > 20) {
      throw badRequest(`حداکثر تعداد برای هر محصول ۲۰ عدد است (ردیف ${index + 1})`);
    }
    return { productId, quantity };
  });

  return { customer, phone, email, city, address, postalCode, note, items };
}
