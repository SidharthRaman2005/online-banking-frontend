const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,52,340.00 — Indian digit grouping, matching the rupee amounts the backend returns. */
export function formatCurrency(value) {
  const number = Number(value ?? 0);
  return inr.format(Number.isFinite(number) ? number : 0);
}

/** Prefixes the sign from the backend's `direction` field — never re-derived on the client. */
export function formatSignedCurrency(value, direction) {
  const sign = direction === 'CREDIT' ? '+ ' : '- ';
  return sign + formatCurrency(Math.abs(Number(value ?? 0)));
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Relative time for anything under a day old; an absolute date after that. */
export function formatRelative(value) {
  if (!value) return '—';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return formatDateOnly(value);
}

/** Account numbers are masked everywhere by default; the full value needs a deliberate reveal. */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return '—';
  return `•••• ${accountNumber.slice(-4)}`;
}

export function groupCardNumber(accountNumber) {
  if (!accountNumber) return '';
  return accountNumber.replace(/(.{4})/g, '$1 ').trim();
}

export function initialsOf(name) {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}
