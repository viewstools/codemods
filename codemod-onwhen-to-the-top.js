const glob = require('fast-glob');
const fs = require('fs');

const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/;
const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/;
const getProp = line => get(PROP, line);
const isBlock = line => is(BLOCK, line);
const isProp = line => is(PROP, line);

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(line => line.trim());

  const next = [];
  let lastBlockIndex;
  lines.forEach((line, i) => {
    if (isBlock(line)) {
      lastBlockIndex = i;
    }

    if (isProp(line)) {
      const [_, prop, _1, value] = getProp(line);

      if (prop === 'onWhen' && i !== lastBlockIndex + 1) {
        next.splice(lastBlockIndex + 1, 0, line);
        return;
      }
    }

    next.push(line);
  });

  return next.join('\n');
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: __dirname,
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    fs.writeFileSync(file, transform(content));
  });
});
