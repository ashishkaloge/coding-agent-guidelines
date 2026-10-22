import { applyDiscount, formatPrice, roundCents } from './price.js';

export class Cart {
  constructor() {
    this.items = [];
  }

  add(name, price, qty = 1) {
    this.items.push({ name, price, qty });
  }

  subtotal() {
    return roundCents(this.items.reduce((sum, i) => sum + i.price * i.qty, 0));
  }

  total(discountPercent = 0) {
    return applyDiscount(this.subtotal(), discountPercent);
  }

  summary(discountPercent = 0) {
    return `${this.items.length} items, total ${formatPrice(this.total(discountPercent))}`;
  }
}
