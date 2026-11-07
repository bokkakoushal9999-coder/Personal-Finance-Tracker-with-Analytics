export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Scholarship',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Other',
];

export const ALL_CATEGORIES = Array.from(
  new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])
);

/**
 * Formats a number as Indian Rupee (INR ₹)
 * @param {number|string} amount
 * @param {boolean} showDecimals
 * @returns {string} e.g. "₹75,000" or "₹75,000.00"
 */
export function formatCurrency(amount, showDecimals = true) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Formats a date string or Date object into a readable date
 * @param {string|Date} date
 * @returns {string} e.g. "04 Nov 2026"
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

