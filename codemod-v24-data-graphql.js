let glob = require('fast-glob')
let fs = require('fs')
let gql = require('graphql-tag')
let { print } = require('graphql')
let prettier = require('prettier')

function transform(rtext) {
  let parsed = gql`
    ${rtext}
  `
  let definition = parsed.definitions[0]
  if (
    definition.operation !== 'query' &&
    definition.operation !== 'subscription'
  )
    return rtext

  // let context = definition.name?.value || 'query_result'
  // let hasManyFields = definition.selectionSet.selections.length > 1

  let firstField = definition.selectionSet.selections[0]
  let firstFieldName = firstField.name.value
  if (firstField.alias) {
    firstFieldName = firstField.alias.value
    delete firstField.alias
  }

  if (!definition.name) {
    definition.name = { kind: 'Name', value: '' }
  }
  definition.name.value = firstFieldName

  return prettier.format(print(parsed), { parser: 'graphql' })
}

glob(['src/**/data.graphql'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then((list) => {
  list.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    fs.writeFileSync(file, transform(content))
  })
})
