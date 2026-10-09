/**
 * These mirror the backend's Bean Validation rules exactly. Client validation is a UX nicety —
 * the server still validates everything, and its errors are surfaced on the same fields.
 */

export const USERNAME_RULE = /^[a-zA-Z0-9._]+$/;
export const ACCOUNT_NUMBER_RULE = /^[1-9]\d{9}$/;
export const UPI_RULE = /^[A-Za-z0-9._]{3,20}@obs$/;

export function validateUsername(value) {
  if (!value?.trim()) return 'Username is required';
  if (value.trim().length < 3 || value.trim().length > 20)
    return 'Username must be between 3 and 20 characters';
  if (!USERNAME_RULE.test(value.trim()))
    return 'Username may only contain letters, digits, dots and underscores';
  return null;
}

export function validateEmail(value) {
  if (!value?.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address';
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8 || value.length > 64) return 'Password must be between 8 and 64 characters';
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value))
    return 'Password must contain at least one letter and one digit';
  return null;
}

export function validateAmount(value, { max } = {}) {
  if (value === '' || value === null || value === undefined) return 'Amount is required';
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Enter a valid amount';
  if (number <= 0) return 'Amount must be greater than zero';
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) return 'Amount may have at most 2 decimal places';
  if (max !== undefined && number > Number(max)) return 'Insufficient balance';
  return null;
}
