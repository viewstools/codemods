const glob = require("fast-glob");
const fs = require("fs");
const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

let CONTEXT_PATH = /let (.*) = useData\(\{\n*\s*(context|path|viewPath): \'?([\w:\s\.]*)\'?\,\n*\s*(context|path|viewPath): \'?([\w:\s\.]*)\'?\,\n*\s*(context|path|viewPath): \'?([\w:\s\.]*)\'?\,\n\s*\}\)/g;
let DATA_PROVIDERS = /context=\"(.*)\"/g;
let USE_DATA_MISSING_VIEW_PATH = /useData\(\{\n*\s*(context|path): \'?([\w:\s\.]*)\'?\,\n*\s*(context|path): \'?([\w:\s\.]*)\'?\,\n*\s*\}\)/g;

function transform(rtext) {
  let text = rtext.replace(/\r\n/g, "\n");
  let useDataValues = [];
  let dataProviderValues = [];
  let matches;
  while ((matches = CONTEXT_PATH.exec(text))) {
    useDataValues.push({
      variable: matches[1],
      [matches[2]]: matches[3],
      [matches[4]]: matches[5],
      [matches[6]]: matches[7],
    });
  }
  while ((matches = DATA_PROVIDERS.exec(text))) {
    dataProviderValues.push({
      context: matches[1],
    });
  }
  while ((matches = USE_DATA_MISSING_VIEW_PATH.exec(text))) {
    console.log(
      `useData with ${matches[1]}="${matches[2]}" and ${matches[3]}="${matches[4]}" is missing viewPath. Please add it and run the script again`
    );
  }

  for (let value of useDataValues) {
    if (value.context === value.path) {
      text = text.replace(new RegExp(`\n\\s*path: '${value.path}',`), "");
    } else if (value.path.startsWith(`${value.context}.`)) {
      text = text.replace(
        `path: '${value.path}',`,
        `path: '${value.path.replace(`${value.context}.`, "")}',`
      );
    }
    text = text.replace(new RegExp(`next\\.${value.context}\\.`, "g"), `next.`);
    text = text.replace(
      new RegExp(`next\\\\?\\.${value.context}\\.`, "g"),
      `next?.`
    );
    let matchNextAssignment = new RegExp(`next\\.${value.context} = (.*)`, "g");
    while ((matches = matchNextAssignment.exec(text))) {
      console.log(
        `Change "next.${value.context} = ${matches[1]}" direct assignment to "${value.variable}.onChange(${matches[1]})"`
      );
    }
  }

  for (let value of dataProviderValues) {
    text = text.replace(
      new RegExp(`next\\\\?\\.${value.context}\\.`, "g"),
      `next?.`
    );
    text = text.replace(
      new RegExp(`value\\\\?\\.${value.context}\\.`, "g"),
      `value?.`
    );

    let matchUsage = new RegExp(`((next|value)\\.${value.context}(\\W))`, "g");
    while ((matches = matchUsage.exec(text))) {
      text = text.replace(matches[1], `${matches[2]}${matches[3]}`);
    }

    let matchNextAssignment = new RegExp(`next\\.${value.context} = (.*)`, "g");
    while ((matches = matchNextAssignment.exec(text))) {
      console.log(
        `Change "next.${value.context} = ${matches[1]}" direct assignment to "data.onChange(${matches[1]})"`
      );
    }

    let matchContextKeyValue = new RegExp(
      `(\\{\\s*\\n*${value.context}: ([\\w'':\\s\\n{}\\[\\],<>\\.|$()?\`=]*)\\,\\s*\\n*\\})`,
      "gs"
    );
    while ((matches = matchContextKeyValue.exec(text))) {
      text = text.replace(matches[1], matches[2]);
    }
  }

  return text;
}

glob(
  [
    "src/**/logic.js",
    "src/**/useDataConfiguration.js",
    "src/**/useDataTransform.js",
    "src/**/useDataOnChange.js",
    "src/**/useDataOnSubmit.js",
    "src/**/useListItemDataOnChange.js",
    "src/**/useListItemDataOnSubmit.js",
    "src/**/Auth.js",
    "src/**/Api.js",
  ],
  {
    bashNative: ["linux"],
    cwd: process.cwd(),
  }
).then((list) => {
  list.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    fs.writeFileSync(file, transform(content));
  });
});
