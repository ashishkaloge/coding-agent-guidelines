import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Cart } from '../src/cart.js';

test('cart totals items', () => {
  const cart = new Cart();
  cart.add('Mug', 12, 2);
  cart.add('Tea', 6);
  assert.equal(cart.total(), 30);
});
