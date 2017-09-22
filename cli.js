#!/usr/bin/env node

const picdiff = require('./index.js')
const util = require('./util.js')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]').argv

const defaultConfig = util.getDefaults({})

const config = Object.assign({}, defaultConfig, argv)
config.isCli = true

switch (config._[0]) {
  case 'generate:diffs':
  case 'gen:diffs':
    picdiff.generateDiffs(config)
    break
  case 'generate:preview':
  case 'gen:preview':
    picdiff.generatePreview(config)
    break
  case 'make':
  case 'diff':
  case 'generate':
    picdiff.generateDiffs(config).then((data) => {
      picdiff.generatePreview(config)
      if (config.stdout) {
        process.stdout.write(JSON.stringify(data, null, 2))
      }
    })
    break
  case 'update':
    picdiff.copyToOriginal(config)
    break
  case 'validate':
    const output = picdiff.validateJson(config)
    if (config.stdout) {
      process.stdout.write(JSON.stringify(output, null, 2))
    }
    break
  case 'clean':
    picdiff.cleanDir(config)
    break
  default:
    break
}
