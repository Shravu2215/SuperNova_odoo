/**
 * Validation rules used across the backend
 * Makes validation consistent and reusable
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const urlRegex = /^https?:\/\/.+/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email) && email.length <= 255;
}

export function isStrongPassword(password: string): boolean {
  // Min 8 chars, 1 uppercase, 1 number, 1 special character
  const strongPattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPattern.test(password);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidUsername(username: string): boolean {
  // Alphanumeric + underscore, 3-20 chars
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export function sanitizeName(name: string): string {
  return name.trim().slice(0, 255);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic international format
  return /^\+?[\d\s\-()]{10,}$/.test(phone.trim());
}
