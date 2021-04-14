const glob = require("fast-glob");
const fs = require("fs");
const is = (thing, line) => thing.test(line);
const get = (regex, line) => line.match(regex);
const DATA = /^data(\s+(.+))?$/;
const DATA_FORMAT = /^dataFormat(\s+(.+))?$/;
const DATA_VALIDATE = /^dataValidate(\s+(.+))?$/;
let BLOCK = /^(\s*)([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/;

function transform(rtext) {
  const text = rtext.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  let data = null;
  let format = null;
  let validate = null;
  let dataAdded = false;
  let next = [];
  for (let index = 0; index < lines.length; index++) {
    let l = lines[index];
    let line = l.trim();

    if (is(BLOCK, l)) {
      // reset it so that it could be assigned to multiple blocks
      dataAdded = false;
    }

    if (is(DATA, line)) {
      if (lines[index - 1].startsWith("is")) {
        data = line;
      } else {
        next.push(l);
      }
    } else if (data && is(DATA_FORMAT, line)) {
      format = line.replace(/dataFormat/g, "format");
    } else if (data && is(DATA_VALIDATE, line)) {
      validate = line.replace(/dataValidate/g, "validate");
    } else if (data && !dataAdded && isDataAssignment(line)) {
      let [, indentation] = get(/^(\s+).+$/, l);
      next.push(indentation + data);
      if (format) {
        next.push(indentation + format);
      }
      if (validate) {
        next.push(indentation + validate);
      }
      next.push(l);

      dataAdded = true;
    } else {
      next.push(l);
    }
  }

  return next.join("\n");
}

function isDataAssignment(line) {
  return (
    line === "value <" ||
    line === "originalValue <" ||
    line === "isSubmitting <" ||
    line === "isValid <" ||
    line === "isValidInitial <" ||
    line === "isInvalid <" ||
    line === "isInvalidInitial <" ||
    line === "onChange <" ||
    line === "onSubmit <" ||
    line.endsWith("<value") ||
    line.endsWith("<originalValue") ||
    line.endsWith("<isValid") ||
    line.endsWith("<isValidInitial") ||
    line.endsWith("<isInvalid") ||
    line.endsWith("<isInvalidInitial") ||
    line.endsWith("<isSubmitting") ||
    line.endsWith("<onChange") ||
    line.endsWith("<onSubmit")
  );
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
