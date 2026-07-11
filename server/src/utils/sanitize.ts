/**
 * Input sanitization to prevent XSS and other attacks
 */

export function sanitizeString(input: any): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, 500);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 255);
}

export function sanitizeInteger(input: any): number {
  const num = parseInt(input, 10);
  return isNaN(num) ? 0 : num;
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "number") {
      sanitized[key] = sanitizeInteger(value);
    } else if (typeof value === "boolean") {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) =>
        typeof v === "string" ? sanitizeString(v) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
