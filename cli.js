#!/usr/bin/env node

const screendiff = require('./index.js')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]').argv

const defaultOptions = {}
const options = Object.assign({}, defaultOptions, argv)

switch (options._[0]) {
  case 'generate:diffs':
  case 'gen:diffs':
    screendiff.generateDiffs()
    break
  case 'generate:preview':
  case 'gen:preview':
    screendiff.generatePreview()
    break
  case 'generate':
    screendiff.generateDiffs()
    screendiff.generatePreview()
    break
  case 'update':
    screendiff.copyToOriginal()
    break
  case 'validate':
    screendiff.validateJson()
    break
  default:
    break
}

console.log(options);

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
