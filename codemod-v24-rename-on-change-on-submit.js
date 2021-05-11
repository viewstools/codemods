const glob = require("fast-glob");
const fs = require("fs");
const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

let CONTEXT_PATH = /let (.*) = useData\(\{/g;

function transform(rtext) {
  let text = rtext.replace(/\r\n/g, "\n");
  let useDataValues = [];
  let matches;
  while ((matches = CONTEXT_PATH.exec(text))) {
    useDataValues.push(matches[1]);
  }

  for (let value of useDataValues) {
    text = text.replace(
      new RegExp(`${value}\\.onChange\\(`, "g"),
      `${value}.change(`
    );
    text = text.replace(
      new RegExp(`${value}\\.onSubmit\\(`, "g"),
      `${value}.submit(`
    );
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
