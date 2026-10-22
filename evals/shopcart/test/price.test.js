import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount, formatPrice, roundCents } from '../src/price.js';

test('roundCents rounds to two places', () => {
  assert.equal(roundCents(1.234), 1.23);
});

test('formatPrice prefixes the currency', () => {
  assert.equal(formatPrice(3), '$3');
});

test('applyDiscount takes a percentage off', () => {
  assert.equal(applyDiscount(200, 25), 150);
});
