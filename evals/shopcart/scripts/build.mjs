// Writes dist/invoice-sample.json using the rounding mode from build.config.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as price from '../src/price.js';
import { slugify } from '../src/util.js';

const config = JSON.parse(readFileSync(new URL('../build.config.json', import.meta.url)));
const round = price[config.rounding];
if (typeof round !== 'function') throw new Error(`Unknown rounding mode: ${config.rounding}`);

const lines = [{ name: 'Blue Mug', amount: 12.345 }, { name: 'Tea Box', amount: 7.005 }];
const invoice = lines.map((l) => ({ id: slugify(l.name), amount: round(l.amount) }));
mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('../dist/invoice-sample.json', import.meta.url), JSON.stringify(invoice, null, 2));
console.log(`built ${invoice.length} invoice lines with ${config.rounding}`);
