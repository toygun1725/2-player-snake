const fs = require('node:fs');
const vm = require('node:vm');

function dictionary(source, name) {
  const start = source.indexOf(`const ${name} = {`);
  if (start < 0) return {};
  const body = source.indexOf('{', start);
  const endings = /\n\s*};/g;
  endings.lastIndex = body;
  for (let end; (end = endings.exec(source));) {
    const literal = source.slice(body, endings.lastIndex - 1);
    try { return vm.runInNewContext(`(${literal})`, { VERSION: 'test' }, { timeout: 1000 }); }
    catch (error) { if (!(error.name === 'SyntaxError')) throw error; }
  }
  throw Error(`Cannot read dictionary ${name}`);
}

function catalog(kind, version = '3.5.3') {
  const source = fs.readFileSync(`Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v${version}.html`, 'utf8');
  const strings = dictionary(source, 'STRINGS');
  const extra = dictionary(source, 'EXTRA_STRINGS');
  for (const match of source.matchAll(/Object\.keys\(([A-Z_0-9]+)\)\.forEach\(locale => \{\s*EXTRA_STRINGS\[locale\]/g)) {
    const patch = dictionary(source, match[1]);
    for (const locale of Object.keys(patch)) extra[locale] = { ...extra[locale], ...patch[locale] };
  }
  const locales = Object.keys(strings);
  const effective = Object.fromEntries(locales.map(locale => [locale, { ...extra[locale], ...strings[locale] }]));
  return { source, strings, extra, locales, effective };
}
module.exports = { dictionary, catalog };
