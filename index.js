const globby = require('globby')
const resemble = require('node-resemble-js')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawnSync
const PWD = process.env.PWD || process.cwd()
const packageRoot = path.resolve('.')

const util = require('./util.js')
const previewTemplate = require('./preview.js').previewTemplate

resemble.outputSettings({
  transparency: 0.5
})

const defaultConfig = util.getDefaults({})
const ALL_PNGS = '*.png'

// TODO:
// Case of one new image

function cleanDir (conf) {
  const config = Object.assign({}, defaultConfig, conf)
  // Make the directory in case it doesn't exist.
  // spawn('mkdir', [config.originalDir])
  spawn('rm', ['-rf', path.join(packageRoot, config.baseDir, config.diffDir)])
}

function copyToOriginal (conf) {
  const config = Object.assign({}, defaultConfig, conf)
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [path.join(packageRoot, config.baseDir, config.originalDir)])
  spawn('cp', ['-R', `${path.join(packageRoot, config.baseDir, config.newDir)}/${ALL_PNGS}`, path.join(packageRoot, config.baseDir, config.originalDir)])
}

function diffFiles (file1, file2, diffFile, conf, cb) {
  const config = Object.assign({}, defaultConfig, conf)
  return resemble(file1).compareTo(file2).onComplete(function (diffData) {
    if (diffData && (diffData.misMatchPercentage !== '0.00' || config.forceDiff)) {
      diffData.getDiffImage().pack().pipe(fs.createWriteStream(diffFile))
    }

    const diffJson = {
      diffFile: diffFile,
      isSameDimensions: diffData.isSameDimensions,
      dimensionDifference: diffData.dimensionDifference,
      misMatchPercentage: diffData.misMatchPercentage,
      analysisTime: diffData.analysisTime
    }
    console.log(diffJson)

    // Write summary json file.
    fs.writeFileSync(diffFile.split('.png').join('.json'), JSON.stringify(diffJson))

    cb(null, diffJson)
  })
}

function generateDiffs (conf) {
  const config = Object.assign({}, defaultConfig, conf)
  console.log('GEN', config)
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [path.join(packageRoot, config.baseDir, config.diffDir)])

  return getScreenshots(path.join(packageRoot, config.baseDir, config.originalDir)).then((screenshots) => {
    console.log('SS', screenshots)
    let resolved = 0
    screenshots.forEach((file1) => {
      const file2 = file1.replace(config.originalDir, config.newDir)
      const diffFile = file1.replace(config.originalDir, config.diffDir)
      diffFiles(file1, file2, diffFile, config, () => {
        resolved++
        if (resolved === screenshots.length - 1) {
          return Promise.resolve(resolved)
        }
      })
    })
  })
}

function getScreenshots (dir) {
  return globby(`${dir}/**/${ALL_PNGS}`)
}

function validateJson (conf) {
  const config = Object.assign({}, defaultConfig, conf)
  return globby(`${path.join(packageRoot, config.baseDir, config.diffDir)}/*.json`).then((files) => {
    let failCount = 0
    let passCount = 0
    let failureArr = []

    files.forEach((file) => {
      const json = require(file)
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

    const verboseOutput = config.verboseOutput && failCount > 0 ? `\n\nFailures: ${JSON.stringify(failureArr, null, 2)}\n` : ''

    const failText = failCount > 0 ? ` ${failCount} failed,` : ''
    const summary = `\npicdiff Tests:${failText} ${passCount} passed, ${files.length} total`

    if (!config.isCli) {
      console.log(`${summary} ${verboseOutput}`)
    }

    if (failCount > 0 && config.isCli) {
      process.exit(1) // eslint-disable-line
      // throw new Error(summary)
    }

    return {
      passed: failCount === 0,
      files,
      passCount,
      failCount,
      failureArr,
      config
    }
  }).catch((e) => {
    console.error(e)
  })
}

function generatePreview (conf) {
  const config = Object.assign({}, defaultConfig, conf)
  return getScreenshots(path.join(packageRoot, config.baseDir, config.originalDir)).then((files) => {
    const verboseOutput = {}
    files.forEach((file) => {
      const jsonFile = file.replace(config.originalDir, config.diffDir).replace('.png', '.json')
      // Fails on the first try, but not that important for now since its extra output.
      try {
        verboseOutput[file] = require(path.join(packageRoot, config.baseDir, jsonFile))
      } catch (e) {
        console.log(e)
      }
    })

    const html = previewTemplate({
      files,
      verboseOutput,
      pwd: PWD,
      config
    })

    const previewFile = `${path.join(packageRoot, config.baseDir, config.diffDir)}/diff-preview.html`
    fs.writeFileSync(previewFile, html, 'utf-8')
    return previewFile
  }).catch((e) => {
    console.error(e)
  })
}

module.exports = {
  cleanDir: cleanDir,
  copyToOriginal: copyToOriginal,
  diffFiles: diffFiles,
  generateDiffs: generateDiffs,
  generatePreview: generatePreview,
  validateJson: validateJson
}
