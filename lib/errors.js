export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export function requireValue(condition, message, status = 400, code = 'invalid_request') {
  if (!condition) throw new HttpError(status, code, message);
}
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function fieldsOnly(value, allowed) {
  requireValue(isObject(value), '请求必须是 JSON 对象。');
  requireValue(Object.keys(value).every(k => allowed.includes(k)), '请求含有未知字段。');
}
