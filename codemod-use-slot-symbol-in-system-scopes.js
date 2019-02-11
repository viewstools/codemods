const glob = require('fast-glob')
const fs = require('fs')

const isSystemScope = line =>
  line === 'when hover' ||
  line === 'when focus' ||
  line === 'when placeholder' ||
  line === 'when active' ||
  line === 'when disabled'

const updateSystemScope = line => `when <${line.split(' ')[1]}`

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, '\n')
  const lines = text.split('\n').map(line => line.trim())

  const next = lines.map((line, i) => {
    if (isSystemScope(line)) return updateSystemScope(line)

    return line
  })

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
