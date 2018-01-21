const { environment } = require('@rails/webpacker')

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
