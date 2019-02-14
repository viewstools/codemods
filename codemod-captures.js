let glob = require('fast-glob')
let fs = require('fs')

let is = (thing, line) => thing.test(line)
let get = (regex, line) => line.match(regex)

let BLOCK = /^(\s*)([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/
let CAPTURE = /^(CaptureEmail|CaptureFile|CaptureNumber|CapturePhone|CaptureSecure|CaptureText)$/
let PROP_SLOT = /^(\s*)([a-z][a-zA-Z0-9]*)(\s+(<[a-zA-Z0-9]*)(\s+(.+)))?$/

let typeMap = {
  CaptureEmail: 'email',
  CaptureFile: 'file',
  CaptureNumber: 'number',
  CapturePhone: 'phone',
  CaptureSecure: 'secure',
  CaptureText: 'text',
}

function transform(rtext) {
  let text = rtext.replace(/\r\n/g, '\n')
  let lines = text.split('\n').map(line => line.trimRight())

  let next = lines
    .map((line, i) => {
      if (is(BLOCK, line)) {
        let [, indentation, blockName, , blockType] = get(BLOCK, line)

        if (blockType && is(CAPTURE, blockType)) {
          let type = typeMap[get(CAPTURE, blockType)[1]]
          return `${indentation}${blockName} Capture\ntype ${type}`
        } else if (!blockType && is(CAPTURE, blockName)) {
          let type = typeMap[get(CAPTURE, blockName)[1]]
          return `${indentation}Capture\ntype ${type}`
        }
      }
      return line
    })
    .filter(line => line !== null)

  return next.join('\n')
}

glob([process.argv[2] || 'src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, transform(content))
  })
})
