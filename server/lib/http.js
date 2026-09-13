/** کلاس خطای کنترل‌شده با کد وضعیت HTTP */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const notFound = (message = 'منبع درخواستی یافت نشد') => new HttpError(404, message);

/** پوشش خطاهای async برای هدایت خودکار به میان‌افزار خطا */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
