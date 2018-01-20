const { environment } = require('@rails/webpacker')

const { resolve, basename, extname } = require('path')
const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')

const filePath = resolve('config', 'rails_engines.yml')
const config = safeLoad(readFileSync(filePath), 'utf8')[process.env.NODE_ENV]
const { include_webpacks } = config

const { execSync } = require('child_process')
const fs = require('fs')

environment.toWebpackConfigForRailsEngine = function() {
  const config = environment.toWebpackConfig()

  include_webpacks.forEach(function(engine) {
    const enginePath = execSync(`bundle show ${engine.name}`).toString().split(/\r?\n/g)[0]
    const filePath = `${enginePath}/${engine.path}`
    const files = fs.readdirSync(filePath)

    // `import 'engine_name'` so that it can be load
    config.resolve.modules.push(filePath)

    files.forEach(function(file){
      const fullPath = `${filePath}/${file}`
      config.entry[`${engine.name}/${basename(fullPath, extname(fullPath))}`] = fullPath
    })
  })

  return config
}

module.exports = environment
