const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatFa(n: number): string {
  const rounded = Math.round(n);
  return toFaDigits(String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
}

export function percentFa(part: number, total: number): string {
  const pct = total <= 0 ? 0 : Math.round((part / total) * 100);
  return `${formatFa(pct)}٪`;
}

const FA_ALPHABET = 'ابجدهABCDEFGH'.split('');

export function candidateLetter(index: number): string {
  return FA_ALPHABET[index] ?? toFaDigits(index + 1);
}
