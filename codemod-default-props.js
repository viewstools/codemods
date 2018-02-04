const glob = require('fast-glob');
const fs = require('fs');

const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/;
const getProp = line => get(PROP, line);
const isProp = line => is(PROP, line);

const CODE_PROPS = ['from', 'when', 'onClick', 'onFocus', 'onWhen'];
const shouldBeProps = prop =>
  CODE_PROPS.includes(prop) || /^on[A-Z]/.test(prop);

const trimNewLinesAtEnd = lines => {
  let end = lines.length - 1;
  for (; end >= 0; end--) {
    if (lines[end] !== '') {
      break;
    }
  }
  return lines.slice(0, end + 1);
};

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n');
  const [viewText, fakePropsText = ''] = text.split('FakeProps');

  const lines = viewText.split('\n').map(line => line.trim());
  const fakeProps = {};
  fakePropsText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => {
      const [name, ...value] = line.split(' ');
      fakeProps[name] = value.join(' ');
    });

  const next = lines.map(line => {
    if (!isProp(line)) return line;

    const [_, prop, _1, value] = getProp(line);

    if (!/^props/.test(value) || shouldBeProps(prop)) return line;

    const fake = value === 'props' ? prop : value.split('.')[1];

    return fakeProps[fake] ? `${line} ${fakeProps[fake]}` : line;
  });

  return trimNewLinesAtEnd(next).join('\n');
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
