let glob = require('fast-glob')
let path = require('path')
let fs = require('fs').promises

;(async () => {
  let designSystemFiles = await glob(
    ['DesignSystem/**/view.blocks', 'DesignSystem/**/react.js'],
    {
      cwd: `${process.cwd()}/src/`,
    }
  )

  let views = designSystemFiles
    .map(item => {
      let next = path.dirname(item)
      let ret = [next]
      while (next) {
        next = path.dirname(next)

        if (next === '.') {
          next = false
        } else {
          ret.push(next)
        }
      }
      return ret
    })
    .flat(1)

  let missingViews = [
    ...new Set(
      views.filter(
        item =>
          !(
            designSystemFiles.includes(`${item}/view.blocks`) ||
            designSystemFiles.includes(`${item}/react.js`)
          )
      )
    ),
  ]

  await Promise.all(
    missingViews.map(item => {
      let depth = item.split('/').length

      let view = [
        `${path.basename(item)} View`,
        ...new Set(
          views
            .filter(
              vitem =>
                vitem.startsWith(item) && vitem.split('/').length - 1 === depth
            )
            .map(vitem => `  ${path.basename(vitem)}`)
        ),
      ].join('\n')

      return fs.writeFile(`${process.cwd()}/src/${item}/view.blocks`, view)
    })
  )
})()
