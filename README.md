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
# v12.0.8
node codemod-shadowRadius-to-shadowBlur.js
# v13.0.0
node codemod-flex-to-flexGrow.js
# v13.0.8
node codemod-expand-transforms.js
# v15.0.0
node codemod-use-camelCase-props.js
# v16.0.0
node codemod-system-scopes-start-with-is.js
# v17.0.0
node codemod-captures.js
```

License BSD-3-Clause
UXtemple Ltd.
