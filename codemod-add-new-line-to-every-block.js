const glob = require('fast-glob');
const fs = require('fs');

const CAPTURE = /^(CaptureEmail|CaptureFile|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|CaptureTextArea)$/i;
const NOT_GROUP = /^(Image|FakeProps|Text|Proxy|SvgCircle|SvgEllipse|SvgLine|SvgPath|SvgPolygon|SvgPolyline|SvgRect|SvgText|SvgStop)$/i;
const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/;

const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

const getBlock = line => {
  // eslint-disable-next-line
  const [_, is, _1, block] = get(BLOCK, line);
  return {
    block: block || is,
    is: block ? is : null,
  };
};
const isCapture = line => is(CAPTURE, line);
const isGroup = line => !is(NOT_GROUP, line) && !isCapture(line);

function shouldAddNewLine(line) {
  const { block } = getBlock(line);
  return !isGroup(block);
}

const isBlock = line => is(BLOCK, line);

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(line => line.trim());

  const next = [];

  let addNewLine = false;
  lines.forEach(line => {
    if (isBlock(line)) {
      if (addNewLine) {
        addNewLine = false;
        next.push('');
      }

      if (shouldAddNewLine(line)) {
        addNewLine = true;
      }
    }

    next.push(line);
  });

  return next.join('\n');
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    fs.writeFileSync(file, transform(content));
  });
});
