const globby = require('globby')
const resemble = require('node-resemble-js')
const fs = require('fs')
const spawn = require('child_process').spawnSync
const PWD = process.env.PWD || process.cwd()

const util = require('./util.js')
const previewTemplate = require('./preview.js').previewTemplate

resemble.outputSettings({
  transparency: 0.5
})

const config = util.getDefaults({})
const ALL_PNGS = '*.png'

// TODO:
// Case of one new image
// Fail cases

function copyToOriginal () {
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [config.originalDir])
  spawn('cp', ['-R', `${config.newDir}/${ALL_PNGS}`, config.originalDir])
}

function diffFiles (file1, file2, diffFile) {
  return resemble(file1).compareTo(file2).onComplete(function (diffData) {
    if (diffData.misMatchPercentage !== '0.00' || config.forceDiff) {
      diffData.getDiffImage().pack().pipe(fs.createWriteStream(diffFile))
    }

    // Write summary json file.
    fs.writeFileSync(diffFile.split('.png').join('.json'), JSON.stringify({
      diffFile: diffFile,
      isSameDimensions: diffData.isSameDimensions,
      dimensionDifference: diffData.dimensionDifference,
      misMatchPercentage: diffData.misMatchPercentage,
      analysisTime: diffData.analysisTime
    }))
  })
}

function generateDiffs () {
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [config.diffDir])

  getScreenshots(config.originalDir).then((screenshots) => {
    screenshots.forEach((file1) => {
      // Read source
      fs.readFile(file1, (err, data) => {
        if (err) throw err
        const file2 = file1.replace(config.originalDir, config.newDir)
        const diffFile = file1.replace(config.originalDir, config.diffDir)
        return diffFiles(file1, file2, diffFile)
      })
    })
  })

  // getScreenshots(config.newDir).then((screenshots) => {
  //   console.log(screenshots);
  // })
}

function getScreenshots (dir) {
  return globby(`${dir}/${ALL_PNGS}`)
}

function validateJson () {
  globby(`${config.diffDir}/*.json`).then((files) => {
    let failCount = 0
    let passCount = 0
    let failureArr = []

    files.forEach((file) => {
      const json = require(`./${file}`)
      if (!json || json.misMatchPercentage !== '0.00') {
        failCount++
        if (json.isSameDimensions) {
          delete json.dimensionDifference
        }
        failureArr.push(json)
      } else {
        passCount++
      }
    })

    const verboseOutput = config.verboseOutput ? `\n\nFailures: ${JSON.stringify(failureArr, null, 2)}\n` : ''

    console.log(`\nScreendiff Tests: ${failCount} failed, ${passCount} passed, ${files.length} total ${verboseOutput}`)
  }).catch((e) => {
    console.error(e)
  })
}

function generatePreview () {
  getScreenshots(config.originalDir).then((files) => {
    const verboseOutput = {}
    files.forEach((file) => {
      const jsonFile = file.replace(config.originalDir, config.diffDir).replace('.png', '.json')
      verboseOutput[file] = require(`./${jsonFile}`)
    })

    const html = previewTemplate({
      files,
      verboseOutput,
      pwd: PWD,
      config
    })

    const previewFile = `${config.diffDir}/diff-preview.html`
    fs.writeFileSync(previewFile, html, 'utf-8')
  }).catch((e) => {
    console.log(e)
  })
}

module.exports = {
  copyToOriginal: copyToOriginal,
  diffFiles: diffFiles,
  generateDiffs: generateDiffs,
  generatePreview: generatePreview,
  validateJson: validateJson
}
