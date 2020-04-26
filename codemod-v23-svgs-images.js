let glob = require('fast-glob')
let path = require('path')
let sfs = require('fs')
let fs = require('fs').promises

function textToLines(rtext) {
  let text = rtext.replace(/\r\n/g, '\n')
  return text.split('\n').map(line => line.trimRight())
}

function linesToText(lines) {
  return lines.join('\n')
}

function cwd(f = '') {
  return path.join(process.cwd(), f)
}

let run = []

function rename(a, b) {
  if (sfs.existsSync(a.replace('/*', ''))) {
    run.push(`git mv ${a} ${b}`)
    if (a.endsWith('/*')) {
      run.push(`rm -rf ${a.replace('/*', '')}`)
    }
  }
}

async function transform(file, fn) {
  return fs.writeFile(
    cwd(file),
    fn(await fs.readFile(cwd(file), 'utf-8'), file)
  )
}

;(async () => {
  let imageFiles = await glob(
    [
      'src/DesignSystem/Images/**/*.bmp',
      'src/DesignSystem/Images/**/*.gif',
      'src/DesignSystem/Images/**/*.jpeg',
      'src/DesignSystem/Images/**/*.jpg',
      'src/DesignSystem/Images/**/*.png',
      'src/DesignSystem/Images/**/*.svg',
    ],
    { cwd: process.cwd() }
  )
  await Promise.all(
    imageFiles.map(async item => {
      try {
        await transform(
          `${item.replace(path.extname(item), '')}/view.blocks`,
          text => {
            let lines = textToLines(text)
            return linesToText(
              lines.map(item => {
                if (/source /.test(item)) {
                  return `source < ./source${ext}`
                } else {
                  return item
                }
              })
            )
          }
        )
      } catch (error) {
        console.error('error refactoring source for ', item)
      }

      let ext = path.extname(item)
      rename(item, `${item.replace(path.extname(item), '')}/source${ext}`)
    })
  )

  let svgFiles = await glob(['src/DesignSystem/Svgs/**/*.svg'], {
    cwd: process.cwd(),
  })
  svgFiles.forEach(item => {
    rename(item, `${item.replace('.svg', '')}/source.svg`)
  })

  fs.writeFile(path.join(process.cwd(), 'run.sh'), run.join('\n'))

  console.log('Run: bash run.sh')
})()
