const glob = require('fast-glob')
const fs = require('fs')

const composeNewLines = line => {
  const name = line.split('(')[0]
  const values = line.match(/\(([^)]+)\)/)[1].split(/,\s|,/)
  const axes = ['X', 'Y', 'Z']

  return values
    .map((val, j) => {
      const lastItem = j === values.length - 1
      return lastItem
        ? `${name}${axes[j]} ${val}`
        : `${name}${axes[j]} ${val}\n`
    })
    .join('')
}

function transform(rtext) {
  console.log('hey im inside', rtext)
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
