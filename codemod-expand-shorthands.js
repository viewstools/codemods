const glob = require('fast-glob');
const fs = require('fs');

const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/;
const getProp = line => get(PROP, line);
const isProp = line => is(PROP, line);

const SHORTHAND = {
  background: ['backgroundColor', 'backgroundImage', 'backgroundSize'],
  border: ['borderWidth', 'borderStyle', 'borderColor'],
  borderBottom: ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
  borderTop: ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
  borderRight: ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
  borderLeft: ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
  borderRadius: [
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ],
  boxShadow: [
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowRadius',
    'shadowSpread',
    'shadowColor',
  ],
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  textShadow: ['shadowOffsetX', 'shadowOffsetY', 'shadowRadius', 'shadowColor'],
  outline: ['outlineWidth', 'outlineStyle', 'outlineColor'],
  overflow: ['overflowX', 'overflowY'],
};
const isShorthand = name => name in SHORTHAND;
const getShorthandExpanded = (name, value) => {
  const props = SHORTHAND[name];

  if (name === 'borderRadius') {
    const theValue = value.replace('px', '');

    return [
      `${props[0]} ${theValue}`,
      `${props[1]} ${theValue}`,
      `${props[2]} ${theValue}`,
      `${props[3]} ${theValue}`,
    ];
  } else if (name.startsWith('border') || name === 'outline') {
    const [width, style, ...color] = value.split(' ');

    return [
      `${props[0]} ${width.replace('px', '')}`,
      `${props[1]} ${style}`,
      `${props[2]} ${color.join(' ')}`,
    ];
  } else if (name === 'boxShadow') {
    const [offsetX, offsetY, blurRadius, spreadRadius, ...color] = value.split(
      ' '
    );

    return [
      `${props[0]} ${offsetX.replace('px', '')}`,
      `${props[1]} ${offsetY.replace('px', '')}`,
      `${props[2]} ${blurRadius.replace('px', '')}`,
      `${props[3]} ${spreadRadius.replace('px', '')}`,
      `${props[4]} ${color.join(' ')}`,
    ];
  } else if (name === 'textShadow') {
    const [offsetX, offsetY, blurRadius, ...color] = value.split(' ');

    return [
      `${props[0]} ${offsetX.replace('px', '')}`,
      `${props[1]} ${offsetY.replace('px', '')}`,
      `${props[2]} ${blurRadius.replace('px', '')}`,
      `${props[3]} ${color.join(' ')}`,
    ];
  } else if (name === 'overflow') {
    return [`${props[0]} ${value}`, `${props[1]} ${value}`];
  } else if (name === 'padding' || name === 'margin') {
    let [top, right, bottom, left] = value.split(' ');
    top = top.replace('px', '');
    right = right ? right.replace('px', '') : top;
    bottom = bottom ? bottom.replace('px', '') : top;
    left = left ? left.replace('px', '') : right || top;

    return [
      `${props[0]} ${top}`,
      `${props[1]} ${right}`,
      `${props[2]} ${bottom}`,
      `${props[3]} ${left}`,
    ];
  }
};

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(line => line.trim());

  const next = lines.map(line => {
    if (!isProp(line)) return line;

    const [_, prop, _1, value] = getProp(line);

    if (!isShorthand(prop) || value.startsWith('props')) return line;

    return getShorthandExpanded(prop, value).join('\n');
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
