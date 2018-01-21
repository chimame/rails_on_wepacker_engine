# README
This is a sample Rails using Rails Engine using Webpacker.

# Usage

```bash
$ bundle install --path vendor/bundle -j4
$ bin/rails s
```

# Description

## Management JavaScript packages

In order to manage the JavaScript package on the Rails Engine side, the application defines `package.json` as follows.

```json
{
  "name": "rails_on_wepacker_engine",
  "private": true,
  "dependencies": {
    "webpacker_engine_client": "git+https://github.com/chimame/webpacker_engine#master"
  }
}
```

By doing this, management of the JavaScript package used by the Engine can be managed by the Engine.

## Compiling JavaScript used by Engine

By default of webpacker you can not use or compile JavaScript on Engine. So add the setting to compile Engine JavaScript on the application side as follows.

### `config/webpack/environment.js`

```javascript
const { environment } = require('@rails/webpacker')

// Add setting for Rails Engine
const { basename, dirname, join, relative, resolve } = require('path')
const { sync } = require('glob')
const extname = require('path-complete-extname')
const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')

const engineConfigPath = resolve('config', 'rails_engines.yml')
const engineConfig = safeLoad(readFileSync(engineConfigPath), 'utf8')[process.env.NODE_ENV]
const { include_webpacks } = engineConfig

const webpackerConfigPath = resolve('config', 'webpacker.yml')
const webpackerConfig = safeLoad(readFileSync(webpackerConfigPath), 'utf8')[process.env.NODE_ENV]
const { extensions } = webpackerConfig

const { execSync } = require('child_process')
const fs = require('fs')

environment.toWebpackConfigForRailsEngine = function() {
  const config = environment.toWebpackConfig()

  include_webpacks.forEach(function(engine) {
    const enginePath = execSync(`bundle show ${engine.name}`).toString().split(/\r?\n/g)[0]
    const filePath = join(enginePath, engine.path)

    // `import 'engine_name'` so that it can be load
    config.resolve.modules.push(filePath)

    const glob = `**/*{${extensions.join(',')}}`
    const paths = sync(join(filePath, glob))
    paths.forEach((path) => {
      const namespace = relative(join(filePath), dirname(path))
      const name = join(namespace, basename(path, extname(path)))
      config.entry[name] = resolve(path)
    })
  })

  return config
}

module.exports = environment
```

### `config/webpack/development.js`

```javascript
const environment = require('./environment')

//module.exports = environment.toWebpackConfig()
module.exports = environment.toWebpackConfigForRailsEngine()
```

As written in `package.json`, Engine JavaScript is also placed under `node_modules`, but it is not compiled by babel-loader setting.
So load JavaScript of Engine from the folder installed by bundler and compile it.
As a caution, it must be placed under the project (`bundle install --path vendor/bundle`).
