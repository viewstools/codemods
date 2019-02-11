const glob = require('fast-glob');
const fs = require('fs');

function transform(rtext) {
  return rtext.replace(/shadowRadius/g, 'shadowBlur');
}

glob(['src/**/*.view'], {
  bashNative: ['linux'],
  cwd: process.cwd(),
}).then(list => {
  list.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    fs.writeFileSync(file, transform(content));
  });
});
