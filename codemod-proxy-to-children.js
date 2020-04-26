let glob = require('fast-glob')
let path = require('path')
let fs = require('fs').promises
// let toCamelCase = require('to-camel-case')

let is = (thing, line) => thing.test(line)
let get = (regex, line) => line.match(regex)

let PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/
let PROP_SLOT = /^([a-z][a-zA-Z0-9]*)(\s+(\<[a-zA-Z0-9]*)(\s+(.+)))?$/

function textToLines(rtext) {
  let text = rtext.replace(/\r\n/g, '\n')
  return text.split('\n').map(line => line.trim())
}

;(async () => {
  let files = await glob(['src/**/*.view'], { cwd: process.cwd() })
  let views = await Promise.all(
    files.map(async file => ({
      file,
      lines: textToLines(await fs.readFile(file, 'utf-8')),
      view: path.basename(file, '.view'),
    }))
  )

  let viewsDeclaringProxy = views
    .filter(({ lines }) => lines.some(line => /proxy true/.test(line)))
    .map(({ file: vfile, view }) => [
      vfile,
      views
        .filter(
          ({ file, lines }) =>
            vfile !== file && lines.some(line => line.includes(view))
        )
        .map(({ file }) => file),
    ])

  // let viewsDeclaringProxyPointOfUse = views.filter(({ file, lines }) =>
  //   viewsDeclaringProxy.some(({ file: vfile, view }) =>
  //     vfile !== file && lines.some(line => line.includes(view))
  //   )
  // )

  console.log('>> Views declaring proxy:')
  viewsDeclaringProxy.map(([file, uses]) => {
    console.log('\n\n>>>>>>  ', file)

    console.log(uses.join('\n'))
  })
})()
