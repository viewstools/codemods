const glob = require('fast-glob')
const fs = require('fs')

const is = (thing, line) => thing.test(line)
const get = (regex, line) => line.match(regex)

const SCOPE = /^when\s+(\<[a-zA-Z0-9]*)$/

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  const next = lines
    .map((line, i) => {
      if (is(SCOPE, line)) {
        const [_, scope] = get(SCOPE, line)
        switch (scope) {
          case '<disabled':
            return `when <isDisabled`

          case '<hover':
            return `when <isHovered`

          case '<focus':
            return `when <isFocused`

          case '<placeholder':
            return `when <isPlaceholder`

          default:
            return line
        }
      } else {
        return line
      }
    })
    .filter(line => line !== null)

  return next.join('\n')
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, transform(content))
  })
})
