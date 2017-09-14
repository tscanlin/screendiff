#!/usr/bin/env node

const screendiff = require('./index.js')
const util = require('./util.js')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]').argv

const defaultConfig = util.getDefaults({})

const configFile = argv.c || argv.config
let configData = {}
if (configFile) {
  configData = require(configFile)
}
const config = Object.assign({}, defaultConfig, configData, argv)

switch (config._[0]) {
  case 'generate:diffs':
  case 'gen:diffs':
    screendiff.generateDiffs(config)
    break
  case 'generate:preview':
  case 'gen:preview':
    screendiff.generatePreview(config)
    break
  case 'generate':
    screendiff.generateDiffs(config)
    screendiff.generatePreview(config)
    break
  case 'update':
    screendiff.copyToOriginal(config)
    break
  case 'validate':
    screendiff.validateJson(config)
    break
  default:
    break
}

// console.log(config)

// screendiff(options, (err, data) => {
//   if (err) {
//     process.stderr.write(JSON.stringify(err))
//   }
//
//   if (options.stdout) {
//     // Indent JSON 2 spaces.
//     process.stdout.write(JSON.stringify(data, null, 2))
//   }
// })
