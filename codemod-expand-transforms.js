const glob = require('fast-glob')
const fs = require('fs')

const UNSUPPORTED_TRANSFORMS = [
  'perspective',
  'scaleX',
  'scaleY',
  'scaleZ',
  'translateZ',
  'transformOriginZ',
]

const isUnsupported = name => UNSUPPORTED_TRANSFORMS.includes(name)

const composeNewLines = line => {
  const name = line.split('(')[0]
  if (isUnsupported(name)) return

  let replacement
  const values = line.match(/\(([^)]+)\)/)[1].split(/,\s|,/)
  if (name === 'rotateZ') {
    replacement = `rotate ${values[0]}`
  } else if (values.length === 1) {
    replacement = `${name} ${values[0]}`
  } else {
    const axes = ['X', 'Y']
    replacement = axes
      .map((axis, j) => `${name}${axis} ${values[j]}`)
      .join('\n')
  }
  return replacement
}

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  const next = []

  lines.forEach(line => {
    if (line.startsWith('transform ')) {
      next.push(composeNewLines(line.split('transform ')[1]))
    } else {
      next.push(line)
    }
  })

  //filtering out empty lines
  return next.filter(n => n).join('\n')
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
