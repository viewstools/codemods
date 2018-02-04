const glob = require('fast-glob')
const fs = require('fs')

const is = (thing, line) => thing.test(line)
const get = (regex, line) => line.match(regex)

// const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/;
const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/
const PROPS = /^(!?props(\.[a-zA-Z0-9]+)?)(\s+(.+))?$/

const getProp = line => get(PROP, line)
const getProps = line => get(PROPS, line)
// const isBlock = line => is(BLOCK, line);
const isProp = line => is(PROP, line)
const isProps = line => is(PROPS, line)

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  const next = lines.map((line, i) => {
    if (!isProp(line)) return line

    const [_, prop, _1, value] = getProp(line)

    if (!isProps(value)) return line

    const [_2, props, propsProp] = getProps(value)

    if (propsProp === `.${prop}`) return line.replace(propsProp, '')

    return line
  })

  return next.join('\n')
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: __dirname,
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, transform(content))
  })
})
