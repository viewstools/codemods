const glob = require("fast-glob");
const fs = require("fs");
const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);

let FORMAT_OUT = /^(\s*)format[\s]+(.+)[\s]+(.+)$/;

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  let next = [];
  for (let index = 0; index < lines.length; index++) {
    let l = lines[index];

    if (is(FORMAT_OUT, l)) {
      let [, indentation, formatIn, formatOut] = get(FORMAT_OUT, l);
      next.push(`${indentation}format ${formatIn}`);
      next.push(`${indentation}formatOut ${formatOut}`);
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
