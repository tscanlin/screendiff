#!/usr/bin/env node

const picdiff = require('./index.js')
const util = require('./util.js')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]').argv

const defaultConfig = util.getDefaults({})

const config = Object.assign({}, defaultConfig, argv)

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
    picdiff.generateDiffs(config).then(() => {
      return picdiff.generatePreview(config)
    })
    break
  case 'update':
    picdiff.copyToOriginal(config)
    break
  case 'validate':
    picdiff.validateJson(config)
    break
  case 'clean':
    picdiff.cleanDir(config)
    break
  default:
    break
}

// console.log(config)

// picdiff(options, (err, data) => {
//   if (err) {
//     process.stderr.write(JSON.stringify(err))
//   }
//
//   if (options.stdout) {
//     // Indent JSON 2 spaces.
//     process.stdout.write(JSON.stringify(data, null, 2))
//   }
// })
