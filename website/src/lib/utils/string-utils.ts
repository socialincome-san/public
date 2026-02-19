import { format } from 'date-fns';

export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyLocale = (
  amount: number,
  currency: string,
  locale: string,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
): string => {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    const num = new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(amount);

    return `${num} ${currency}`;
  }
};

export const humanize = (value: string): string => {
  return value.replace(/_/g, ' ');
};

export const titleCase = (value: string): string => {
  return value.replace(/^_*(.)|_+(.)/g, (s, c, d) => (c ? c.toUpperCase() : ' ' + d.toUpperCase()));
};

export const formatNumberLocale = (
  value: number,
  locale: string,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
): string => {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;

  return new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(value);
};

export const formatDate = (date: Date | string | null | undefined, pattern = 'dd.MM.yyyy'): string => {
  if (!date) {
    return '—';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return format(d, pattern);
  } catch {
    return '—';
  }
};
