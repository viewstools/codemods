let glob = require('fast-glob')
let fs = require('fs')

let is = (thing, line) => thing.test(line)
let get = (regex, line) => line.match(regex)

let BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/
let PROP = /^(\s*)([a-z][a-zA-Z0-9]*)\s+(.+)?$/
let getProp = line => get(PROP, line)
let isBlock = line => is(BLOCK, line)
let isProp = line => is(PROP, line)

function transform(rtext, pathToStory) {
  let text = rtext.replace(/\r\n/g, '\n')
  let lines = text.split('\n').map(line => line.trimRight())

  let next = []
  let lastBlockIndex
  lines.forEach((line, i) => {
    if (i === 0 && pathToStory.startsWith('src/')) {
      let id = pathToStory.split('/').pop()
      next.push(`${id} Block`)
      return
    }

    if (isBlock(line)) {
      lastBlockIndex = i
    }

    if (isProp(line)) {
      let [, indentation, prop, value] = getProp(line) || []

      // console.log('prop', prop)

      if (prop === 'flow') {
        next.push(`is ${value}`)
        return
      }

      // if (prop === 'onClick') {
      //   console.log('found onClick', line, 'value is "', value, '"')
      // }

      if (prop === 'onClick' && value === '<setFlow') {
        let onClickId = lines.find((line2, j) => {
          if (j < lastBlockIndex) return
          let [, , prop] = getProp(line2) || []
          return prop === 'onClickId'
        })

        if (onClickId) {
          let id = onClickId
            .trim()
            .split(' ')[1]
            .replace(`${pathToStory}/`, '')
          // console.log("PATH", `${pathToStory}/`)
          // console.log("ID", onClickId.trim().split(' ')[1])

          next.push(`${indentation}onClick <setFlowTo ${id}`)
          return
        } else {
          console.log(
            'Missing onClick for ',
            pathToStory,
            ' line ',
            i,
            ' : ',
            line
          )
        }
      }

      if (prop === 'onClickId') return

      if (/isHoveredManual/.test(line)) {
        next.push(line.replace('isHoveredManual', 'isHovered'))
        return
      }

      //       if (prop === 'onWhen' && i !== lastBlockIndex + 1) {
      //         next.splice(lastBlockIndex + 1, 0, line);
      //         return;
      //       }
    }

    next.push(line)
  })

  return next.join('\n')
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(
      file,
      transform(content, file.replace('src/Stories', '').replace('.view', ''))
    )
  })
})

/*
>>> Run:

findjsr "useFlow\.js" "Logic\/ViewsFlow\.js" src
findjsr useSetFlow useSetFlowTo src
findjsr setFlow setFlowTo src
findjsr "'useData.js" "'Data\/ViewsData\.js" src
git mv src/Data/useSetFlowBasedOnData.js src/Data/useSetFlowToBasedOnData.js


>>> Update App.view.logic.js change Flow to ViewsFlow


>>> Update views section .gitignore with:
*/
let gitignore = `
# views
**/*.view.js
**/Fonts/*.js
src/Data/ViewsData.js
src/Logic/ViewsFlow.js
src/Logic/useIsBefore.js
src/Logic/useIsMedia.js
src/Logic/useIsHovered.js
src/Logic/ViewsTools.view
src/Logic/ViewsTools.view.logic.js
`
/*
>> Then remove the old files:

rm -f src/useData.js src/useFlow.js src/useIsBefore.js src/useIsMedia.js src/Tools.view src/Tools.view.logic.js

*/
