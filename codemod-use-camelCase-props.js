const glob = require("fast-glob");
const fs = require("fs");

function transform(rtext) {
  const hyphenatedText = rtext.match(/([-])([a-z])/);
  return hyphenatedText
    ? rtext.replace(/([-])([a-z])/g, hyphenatedText[2].toUpperCase())
    : rtext;
}

glob(["src/**/*.view"], {
  bashNative: ["linux"],
  cwd: __dirname
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, "utf-8");
    fs.writeFileSync(file, transform(content));
  });
});
