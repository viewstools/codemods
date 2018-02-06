const glob = require('fast-glob')
const fs = require('fs')
const path = require('path')

const is = (thing, line) => thing.test(line)
const get = (regex, line) => line.match(regex)

const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/

const getProp = line => get(PROP, line)
const isProp = line => is(PROP, line)

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())
  const logic = []

  const next = lines.map((line, i) => {
    if (!isProp(line)) return line

    const [_, prop, _1, value] = getProp(line)

    if (
      /(&&|\|\||===|==|!==|!=|\?|:|=>|\(\)|\{)/.test(value) ||
      /props\.(.+)?\./.test(value)
    ) {
      logic.push(`${prop}={${value}}`)
      return `${prop} props`
    }

    return line
  })

  return {
    lines: next.join('\n'),
    logic,
  }
}

function getLogic(view, logic) {
  return `import ${view} from './${view}.view.js'
import React from 'react'

const ${view}Logic = props => (
  <${view}
    {...props}
    ${logic.join('\n')}
  />
)
export default ${view}Logic`
}

const commentOut = logic => logic.map(l => `// ${l}`).join('\n')

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: __dirname,
}).then(list => {
  list.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const ret = transform(content)

      if (ret.logic.length > 0) {
        if (fs.existsSync(`${file}.logic.js`)) {
          fs.appendFileSync(`${file}.logic.js`, `\n\n${commentOut(ret.logic)}`)
        } else {
          fs.writeFileSync(
            `${file}.logic.js`,
            getLogic(path.basename(file, '.view'), ret.logic)
          )
        }
        fs.writeFileSync(file, ret.lines)
      }
    } catch (error) {
      console.error(file, error)
    }
  })
})
