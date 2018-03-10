const glob = require('fast-glob')
const fs = require('fs')

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  const next = []

  lines.forEach(line => {
    if (line.startsWith('flex ')) {
      next.push(line.replace('flex ', 'flexGrow '))
      next.push('flexShrink 1')
      next.push('flexBasis 0%')
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
