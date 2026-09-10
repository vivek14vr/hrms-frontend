import { describe, expect, it } from 'vitest';
import { formatMoney } from '../lib/api';

describe('formatMoney', () => {
  it('formats payroll values as INR', () => {
    expect(formatMoney(98000)).toContain('98,000');
  });
});
