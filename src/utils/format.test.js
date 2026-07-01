import { num, numOrNull, slugify, formatCurrency, formatRate } from './format.js';

describe('num', () => {
  it('parses plain and comma-formatted numbers', () => {
    expect(num('2,500')).toBe(2500);
    expect(num('0.012')).toBe(0.012);
    expect(num(42)).toBe(42);
  });
  it('defaults invalid/blank to 0', () => {
    expect(num('')).toBe(0);
    expect(num('abc')).toBe(0);
    expect(num(null)).toBe(0);
    expect(num(undefined)).toBe(0);
  });
});

describe('numOrNull', () => {
  it('returns null for blank/invalid', () => {
    expect(numOrNull('')).toBeNull();
    expect(numOrNull('   ')).toBeNull();
    expect(numOrNull('xyz')).toBeNull();
  });
  it('parses valid numbers including zero', () => {
    expect(numOrNull('0')).toBe(0);
    expect(numOrNull('99.9')).toBe(99.9);
    expect(numOrNull('1,250')).toBe(1250);
  });
});

describe('slugify', () => {
  it('creates a file-safe slug', () => {
    expect(slugify('Northwind Analytics')).toBe('northwind-analytics');
    expect(slugify('  A & B  ')).toBe('a-b');
  });
  it('falls back to "client" when empty', () => {
    expect(slugify('')).toBe('client');
    expect(slugify('!!!')).toBe('client');
  });
});

describe('currency formatting', () => {
  it('formats whole dollars', () => {
    expect(formatCurrency('2,500')).toBe('$2,500');
    expect(formatCurrency(0)).toBe('$0');
  });
  it('formats rates with decimals', () => {
    expect(formatRate('0.012')).toBe('$0.012');
    expect(formatRate(1)).toBe('$1.00');
  });
});
