# vscode-jasmine-test-runner
vscode-jasmine-test-runner is extension allows you to run and debug jasmine-based.

## configuration
Jasmine test runner can read config from vscode settings (user and workspace), `jasmine-test-runner.json` file or from `package.json` file under property `jasmine-test-runner`.

### jasmine.binary
Path to `jasmine.js` file relative to workspace root folder.

### jasmine.config
Optional path to `jasmine.json` relative to `package.json` file.

### code.source
Optional path to tests folder relative to `package.json` file.

### code.compiled
Optional path to compiled tests files relative to `package.json` file.
Primary usecase - running compiled `*.spec.js` files from origin `*.spec.ts` file.
