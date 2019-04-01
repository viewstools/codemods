let glob = require('fast-glob')
let fs = require('fs')

let BLOCK = /^\s*([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/
let EMPTY = /^$/
let ON_WHEN = /\s*onWhen </

let is = (thing, line) => thing.test(line)
let get = (regex, line) => line.match(regex)

let getBlock = line => {
  // eslint-disable-next-line
  let [_, is, _1, block] = get(BLOCK, line)
  return {
    block: block || is,
    is: block ? is : null,
  }
}

let indent = level => new Array(Math.max(level, 0)).fill('  ').join('')

function transform(rtext) {
  let text = rtext.replace(/\r\n/g, '\n')
  let lines = text.split('\n').map(line => line.trim())

  let next = []
  let level = 0

  lines.forEach(line => {
    if (is(EMPTY, line)) {
      level--
      return
    } else if (is(ON_WHEN, line)) {
      level--
    }

    next.push(`${indent(level)}${line.trim()}`)

    if (is(BLOCK, line) || is(ON_WHEN, line)) {
      level++
    }
  })

  return next.join('\n')
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8')
    console.log('-> ', file)
    fs.writeFileSync(file, transform(content))
  })
})
