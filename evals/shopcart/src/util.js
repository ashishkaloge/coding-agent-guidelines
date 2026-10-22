export function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function debugDump(obj) {
  console.log(JSON.stringify(obj, null, 2));
}
