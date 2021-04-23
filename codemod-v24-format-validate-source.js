const glob = require("fast-glob");
const fs = require("fs");
const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

let FORMAT = /^(\s*)(format|formatOut)[\s]+(.+)$/;
let VALIDATE = /^(\s*)validate[\s]+(.+)$/;

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  let next = [];
  for (let index = 0; index < lines.length; index++) {
    let l = lines[index];

    if (is(FORMAT, l)) {
      let [, indentation, format, formatFn] = get(FORMAT, l);
      next.push(`${indentation}${format} /Data/format.js ${formatFn}`);
    } else if (is(VALIDATE, l)) {
      let [, indentation, validateFn] = get(VALIDATE, l);
      next.push(`${indentation}validate /Data/validate.js ${validateFn}`);
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
