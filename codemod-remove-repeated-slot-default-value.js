let glob = require('fast-glob')
let fs = require('fs')

let is = (thing, line) => thing.test(line)
let get = (regex, line) => line.match(regex)

// let PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/
let PROP_SLOT = /^(\s*)([a-z][a-zA-Z0-9]*)(\s+(<[a-zA-Z0-9]*)(\s+(.+)))?$/

function transform(rtext) {
  let text = rtext.replace(/\r\n/g, '\n')
  let lines = text.split('\n').map(line => line.trimRight())

  let next = lines
    .map((line, i) => {
      if (is(PROP_SLOT, line)) {
        let [, indentation, prop, , slot, , value] = get(PROP_SLOT, line)

        if (!slot && !value) return null

        let maybeDefaultValue = slot === `<${value}` ? '' : ` ${value}`
        return `${indentation}${prop} ${slot}${maybeDefaultValue}`
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
    let content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, transform(content))
  })
})
