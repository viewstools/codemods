# Views Tools shorthands

Helpers to migrate your code to newer versions of Views Tools.

Copy the files into the root of your Views project and run them with `node file.js`.
See the diff it generates with `git diff` and make sure it does what you want :).

We recommend you run them in this order:

```
node codemod-add-new-line-to-every-block.js
node codemod-expand-shorthands.js
node codemod-use-props-shortcut.js
node codemod-onwhen-to-the-top.js
node codemod-default-props.js
node codemod-extract-complex-props-to-logic.js
node codemod-props-to-slots.js
node codemod-use-slot-symbol-in-system-scopes.js
```

License BSD-3-Clause
UXtemple Ltd.
