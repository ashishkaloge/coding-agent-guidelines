// Price helpers shared by the cart and the build script.

export function roundCents(amount) {
  return Math.round(amount * 100) / 100;
}

export function formatPrice(amount, currency = "$") {
  var rounded = roundCents(amount);
  return currency + String(rounded);
}

export function applyDiscount(amount, percent) {
  if (percent < 0 || percent > 100) throw new RangeError("percent must be 0-100");
  return roundCents(amount * (1 - percent / 100));
}

// Older rounding kept for invoices generated before v0.3.
export function legacyRound(amount) {
  return Math.floor(amount * 100 + 0.5) / 100;
}
