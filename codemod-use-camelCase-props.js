const glob = require('fast-glob')
const fs = require('fs')
const toCamelCase = require('to-camel-case')

const is = (thing, line) => thing.test(line)
const get = (regex, line) => line.match(regex)

const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/
const PROP_SLOT = /^([a-z][a-zA-Z0-9]*)(\s+(\<[a-zA-Z0-9]*)(\s+(.+)))?$/

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  const next = lines
    .map((line, i) => {
      if (is(PROP_SLOT, line)) {
        const [_, prop, _1, slot, _2, value] = get(PROP_SLOT, line)
        if (!slot && !value) return null

        return `${prop} ${slot} ${maybeMakeHyphenated(prop, value)}`
      } else if (is(PROP, line)) {
        const [_, prop, _1, value] = get(PROP, line)
        if (!value) return null

        return `${prop} ${maybeMakeHyphenated(prop, value)}`
      } else {
        return line
      }
    })
    .filter(line => line !== null)

  return next.join('\n')
}

const MAYBE_HYPHENATED_STYLE_PROPS = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'backgroundBlendMode',
  'backgroundClip',
  'backgroudOrigin',
  'backgroundRepeat',
  'boxSizing',
  'clear',
  'cursor',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexWrap',
  'float',
  'fontStretch',
  'justifyContent',
  'objectFit',
  'overflowWrap',
  'textAlign',
  'textDecorationLine',
  'textTransform',
  'whiteSpace',
  'wordBreak',
]

const maybeMakeHyphenated = (name, value) =>
  (MAYBE_HYPHENATED_STYLE_PROPS.includes(name) && /-/.test(value)) ||
  /(flex|space)-/.test(value)
    ? toCamelCase(value)
    : value

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, transform(content))
  })
})
