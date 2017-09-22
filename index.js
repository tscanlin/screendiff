const globby = require('globby')
// const resemble = require('resemblejs') // require('resemblejs/compareImages')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawnSync
const PWD = process.env.PWD || process.cwd()
const packageRoot = path.resolve('.')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch')
const util = require('./util.js')
const previewTemplate = require('./preview.js').previewTemplate

const defaultConfig = util.getDefaults({})

function getConfig (conf) {
  const configData = require(path.join(packageRoot, conf.baseDir, conf.configFile))
  let config = Object.assign({}, defaultConfig, conf, configData)
  // console.log(path.join(packageRoot, config.baseDir, config.configFile))
  // config = Object.assign(config, configData)
  // try {
  // } catch (e) {
  //   console.log(e)
  // }
  return config
}

const ALL_PNGS = '*.png'

// TODO:
// Case of one new image

function cleanDir (conf) {
  const config = getConfig(conf)
  // Make the directory in case it doesn't exist.
  // spawn('mkdir', [config.originalDir])
  spawn('rm', ['-rf', path.join(packageRoot, config.baseDir, config.diffDir)])
}

function copyToOriginal (conf) {
  const config = getConfig(conf)
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [path.join(packageRoot, config.baseDir, config.originalDir)])
  spawn('cp', ['-R', `${path.join(packageRoot, config.baseDir, config.newDir)}/${ALL_PNGS}`, path.join(packageRoot, config.baseDir, config.originalDir)])
}

function diffFiles (file1, file2, diffFile, conf, cb) {
  // const config = getConfig(conf)

  const img1 = fs.createReadStream(file1).pipe(new PNG()).on('parsed', doneReading)
  const img2 = fs.createReadStream(file2).pipe(new PNG()).on('parsed', doneReading)
  let filesRead = 0

  function doneReading () {
    if (++filesRead < 2) return
    const diff = new PNG({ width: img1.width, height: img1.height })
    const pixelDiffCount = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0.1})
    diff.pack().pipe(fs.createWriteStream(diffFile))

    const res = {}
    res.pixelDiffCount = pixelDiffCount
    res.width = img1.width
    res.height = img1.height
    res.misMatchPercentage = (pixelDiffCount / (img1.width * img1.height)) * 100

    cb(null, res)
  }
}

function generateDiffs (conf) {
  const config = getConfig(conf)
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [path.join(packageRoot, config.baseDir, config.diffDir)])
  return getScreenshots(path.join(packageRoot, config.baseDir, config.originalDir)).then((screenshots) => {
    const diffMap = {}
    let resolved = 0
    return new Promise(function (resolve) {
      screenshots.forEach((file1) => {
        const file2 = file1.replace(config.originalDir, config.newDir)
        const diffFile = file1.replace(config.originalDir, config.diffDir)
        diffFiles(file1, file2, diffFile, config, (err, res) => {
          if (err) throw err
          resolved++
          diffMap[diffFile] = res
          if (resolved === screenshots.length) {
            const results = summarizeResults({
              total: resolved,
              diffMap: diffMap
            })

            const resultsFile = path.join(packageRoot, config.baseDir, config.diffDir, config.resultsFile)
            fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2), 'utf-8')
            return resolve(results)
          }
        })
      })
    })
  })
}

function getScreenshots (dir) {
  return globby(path.join(dir, '**', ALL_PNGS))
}

function summarizeResults (results) {
  const summary = {}
  summary.failed = 0
  summary.passed = 0

  Object.keys(results.diffMap).forEach((key) => {
    const obj = results.diffMap[key]
    if (obj.pixelDiffCount !== 0) {
      summary.failed++
    } else if (obj.pixelDiffCount === 0) {
      summary.passed++
    }
  })

  return Object.assign({}, results, summary)
}

function validateJson (conf) {
  const config = getConfig(conf)

  const resultsFile = path.join(packageRoot, config.baseDir, config.diffDir, config.resultsFile)
  const results = require(resultsFile)

  const verboseOutput = config.verboseOutput && results.failed > 0 ? `\n\nFailures: ${JSON.stringify(results, null, 2)}\n` : ''

  const failText = results.failed > 0 ? ` ${results.failed} failed,` : ''
  const summary = `\npicdiff Tests:${failText} ${results.passed} passed, ${results.total} total`

  if (!config.isCli) {
    console.log(`${summary} ${verboseOutput}`)
  }

  if (results.failed > 0 && config.isCli) {
    // process.exit(1) // eslint-disable-line
    throw new Error(summary)
  }

  return {
    succeded: results.failed === 0,
    passed: results.passed,
    failed: results.failed,
    total: results.total,
    config
  }
}

function generatePreview (conf) {
  const config = getConfig(conf)
  return getScreenshots(path.join(packageRoot, config.baseDir, config.originalDir)).then((files) => {
    const verboseOutput = require(path.join(packageRoot, config.baseDir, config.diffDir, config.resultsFile))

    const html = previewTemplate({
      files,
      verboseOutput,
      pwd: PWD,
      config
    })

    const previewFile = `${path.join(packageRoot, config.baseDir, config.diffDir)}/${config.previewHtmlFile}`
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
