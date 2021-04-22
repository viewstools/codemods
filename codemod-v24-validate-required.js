const glob = require("fast-glob");
const fs = require("fs");
const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

let VALIDATE_REQUIRED = /^(\s*)validate[\s]+(.+)[\s]+required$/;

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  let next = [];
  for (let index = 0; index < lines.length; index++) {
    let l = lines[index];

    if (is(VALIDATE_REQUIRED, l)) {
      let [, indentation, validate] = get(VALIDATE_REQUIRED, l);
      next.push(`${indentation}validate ${validate}`);
      next.push(`${indentation}required true`);
    } else {
      next.push(l);
    }
  }

  return next.join("\n");
}

glob(["src/**/view.blocks"], {
  bashNative: ["linux"],
  cwd: process.cwd(),
}).then((list) => {
  list.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    fs.writeFileSync(file, transform(content));
  });
});
