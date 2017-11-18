# README
This is a sample Rails using Rails Engine using Webpacker.

# Description

## Management JavaScript packages

In order to manage the JavaScript package on the Rails Engine side, the application defines `package.json` as follows.

```json
{
  "name": "rails_on_wepacker_engine",
  "private": true,
  "dependencies": {
    "webpacker_engine": "git+https://github.com/chimame/webpacker_engine#master"
  }
}
```

By doing this, management of the JavaScript package used by the Engine can be managed by the Engine.

## Compiling JavaScript used by Engine

By default of webpacker you can not use or compile JavaScript on Engine. So add the setting to compile Engine JavaScript on the application side as follows.

```javascript
// config/webpack/environment.js
const { environment } = require('@rails/webpacker')

// Add setting for Rails Engine
const { resolve, basename, extname } = require('path')
const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')

const filePath = resolve('config', 'rails_engines.yml')
const config = safeLoad(readFileSync(filePath), 'utf8')[process.env.NODE_ENV]
const { include_webpacks } = config

const fs = require('fs')

environment.toWebpackConfigForRailsEngine = function() {
  const config = environment.toWebpackConfig()

  Object.keys(include_webpacks).forEach(function(key) {
    const val = this[key]
    const enginePath = `${__dirname}/../../node_modules/${key}/`
    const filePath = `${enginePath}${val}`
    const files = fs.readdirSync(filePath)
    files.forEach(function(file){
      const fullPath = `${filePath}/${file}`
      config.entry[`${key}_${basename(fullPath, extname(fullPath))}`] = fullPath
    })
  }, include_webpacks)

  config.module.rules.map(function(rule) {
    if (rule.exclude !== undefined && rule.exclude.source !== undefined && rule.exclude.source.includes('node_modules')) {
      rule.exclude = new RegExp(`node_modules\/(?!${Object.keys(include_webpacks).join('|')})\/`)
      return rule
    } else {
      return rule
    }
  })

  return config
}

module.exports = environment
```

```javascript
// config/webpack/development.js
const environment = require('./environment')

//module.exports = environment.toWebpackConfig()
module.exports = environment.toWebpackConfigForRailsEngine()
```

As written in `package.json`, Engine JavaScript is also placed under `node_modules`, but it is not compiled by babel-loader setting.
So we rewrite the setting of `exclude` and compile only Engine.
