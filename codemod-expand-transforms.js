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

const composeTransformNewLines = line => {
  const name = line.split('(')[0]
  if (isUnsupported(name)) return line

  const valuesMatch = line.match(/\(([^)]+)\)/)
  if (!valuesMatch) return line

  const values = valuesMatch[1].split(/,\s|,/)
  if (name === 'rotateZ') {
    return `rotate ${values[0]}`
  } else if (values.length === 1) {
    return `${name} ${values[0]}`
  } else {
    const axes = ['X', 'Y']
    return axes.map((axis, j) => `${name}${axis} ${values[j]}`).join('\n')
  }
}

const composeTransformOriginNewLines = line => {
  if (line.startsWith('<')) {
    const [x, y] = line.replace('< ').split(' ')
    return `transformOriginX < ${x}\ntransformOriginY < ${y}`
  } else {
    const [x, y] = line.split(' ')
    return `transformOriginX ${x}\ntransformOriginY ${y}`
  }
}

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  return lines
    .map(
      line =>
        line.startsWith('transform ')
          ? composeTransformNewLines(line.split('transform ')[1])
          : line.startsWith('transformOrigin ')
            ? composeTransformOriginNewLines(line.split('transformOrigin ')[1])
            : line
    )
    .join('\n')
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      fs.writeFileSync(file, transform(content))
    } catch (error) {
      console.error(error)
    }
  })
})
