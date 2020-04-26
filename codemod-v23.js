let glob = require('fast-glob')
let path = require('path')
let sfs = require('fs')
let fs = require('fs').promises
let mfs = require('micro-fs')

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

async function rmdir(a) {
  try {
    await fs.rmdir(cwd(a), { recursive: true })
  } catch (error) {}
}

async function mkdir(a) {
  try {
    if (sfs.existsSync(a)) {
      run.push(`mkdir -p ${a}`)
    }
    await fs.mkdir(cwd(a))
  } catch (error) {}
}

async function move(a, b) {
  try {
    await mfs.move(a, b)
    await rmdir(a.replace('/*', ''))
  } catch (error) {}
}

async function transform(file, fn) {
  return fs.writeFile(
    cwd(file),
    fn(await fs.readFile(cwd(file), 'utf-8'), file)
  )
}

function transformIndexJs(text) {
  return text
    .replace('./Stories/App.view.logic.js', './App/logic.js')
    .replace('./Views/App', './App/logic.js')
}

function transformBlock(text) {
  let [first, ...rest] = textToLines(text)
  return linesToText([`${first.split(' ')[0]} View`, ...rest])
}

function transformBlockLogic(text) {
  return text.replace('.block.js', '.view.js')
}

let IMPORT = /^import\s+(.+?)\s+from\s+'.+\.(view|block)\.js/
let EXPORT = /export default function .+?Logic/
function transformLogicJs(text, file) {
  let viewUse = null
  let defaultProps = null

  let lines = textToLines(text).map(item => {
    if (IMPORT.test(item) && !viewUse) {
      let [, name] = item.match(IMPORT)

      if (name === 'Info' && !file.endsWith('Info.view.js')) {
        return item
      }

      viewUse = new RegExp(`<${name}`)
      defaultProps = new RegExp(`${name}Logic.defaultProps`)

      return `import View from './view.js'`
    } else if (item === "import Info from 'Components/Info.view.js';") {
      return `import Info from 'DesignSystem/Info/view.js'`
    } else if (
      item === "import LoadingBar from 'Components/Loadingbar.view.logic.js';"
    ) {
      return `import LoadingBar from 'DesignSystem/LoadingBar/logic.js'`
    } else if (viewUse && viewUse.test(item)) {
      return item.replace(viewUse, '<View')
    } else if (EXPORT.test(item)) {
      return item.replace(EXPORT, `export default function Logic`)
    } else if (defaultProps && defaultProps.test(item)) {
      return item.replace(defaultProps, 'Logic.defaultProps')
    }

    return item
  })

  return linesToText(lines)
}

;(async () => {
  await mfs.delete('src/**/*.view.js')
  await mfs.delete('src/**/*.block.js')

  await transform('src/index.js', transformIndexJs)

  // await rmdir('src/Views')
  // await rmdir('src/Stories')

  await mkdir('src/DesignSystem')

  // await move('src/use*.js', 'src/Logic')

  let blockFiles = await glob(['src/**/*.block'], { cwd: process.cwd() })
  await Promise.all(
    blockFiles.map(async item => {
      await transform(item, transformBlock)
      let dir = item.replace('.block', '')
      await mkdir(dir)
      rename(item, `${dir}/view.blocks`)
      rename(`${item}.logic.js`, `${dir}/logic.js`)
      rename(`${item}.specs.md`, `${dir}/specs.md`)
      rename(`${item}.todos.md`, `${dir}/todos.md`)
    })
  )

  let blockLogicFiles = await glob(['src/**/*.block.logic.js'], {
    cwd: process.cwd(),
  })
  await Promise.all(
    blockLogicFiles.map(async item => {
      await transform(item, transformBlockLogic)
      // rename(item, item.replace('.block', '.view'))
    })
  )

  let viewFiles = await glob(['src/**/*.view'], { cwd: process.cwd() })

  await Promise.all(
    viewFiles.map(async item => {
      let dir = item.replace('.view', '')
      await mkdir(dir)
      rename(item, `${dir}/view.blocks`)
      rename(`${item}.logic.js`, `${dir}/logic.js`)
      rename(`${item}.specs.md`, `${dir}/specs.md`)
      rename(`${item}.todos.md`, `${dir}/todos.md`)
    })
  )

  let logicFiles = await glob(['src/**/*.view.logic.js'], {
    cwd: process.cwd(),
  })

  await Promise.all(
    logicFiles.map(async item => {
      return transform(item, transformLogicJs)
    })
  )


  rename('src/Blocks/*', 'src/DesignSystem')
  rename('src/Buttons/*', 'src/DesignSystem')
  rename('src/Cards/*', 'src/DesignSystem')
  rename('src/Captures/*', 'src/DesignSystem')
  rename('src/Components/*', 'src/DesignSystem')
  rename('src/Custom/*', 'src/DesignSystem')
  rename('src/MicroCopy/*', 'src/DesignSystem')
  rename('src/Fonts', 'src/DesignSystem/Fonts')
  rename('src/Images', 'src/DesignSystem/Images')
  rename('src/Svgs', 'src/DesignSystem/Svgs')
  rename('src/Stories/*', 'src/')
  rename('src/Views/*', 'src/')

  fs.writeFile(path.join(process.cwd(), 'run.sh'), run.join('\n'))

  console.log('Run: bash run.sh')

  // await move('src/Stories/*', 'src')
  // // rename('src/Stories/App.view', 'src/App.view')
  // // rename('src/Stories/App.view.logic.js', 'src/App.view.logic.js')
  // await move('src/Views/*', 'src')
  // // rename('src/Views/App.view', 'src/App.view')
  // // rename('src/Views/App.view.logic.js', 'src/App.view.logic.js')

  // await move('src/Blocks/*', 'src/DesignSystem')
  // await move('src/Buttons/*', 'src/DesignSystem')
  // await move('src/Cards/*', 'src/DesignSystem')
  // await move('src/Captures/*', 'src/DesignSystem')
  // await move('src/Components/*', 'src/DesignSystem')
  // await move('src/Custom/*', 'src/DesignSystem')
  // await move('src/MicroCopy/*', 'src/DesignSystem')
  // await move('src/Fonts', 'src/DesignSystem')
  // await move('src/Images', 'src/DesignSystem')
  // await move('src/Svgs', 'src/DesignSystem')
})()
