const path = require('path')
const globby = require('globby')
const resemble = require('node-resemble-js')
const fs = require('fs')
const PNG = require('pngjs').PNG
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
      const diffImg = diffData.getDiffImage().pack().pipe(fs.createWriteStream(diffFile))
    }

    // Write summary json file.
    fs.writeFile(diffFile.split('.png').join('.json'), JSON.stringify({
      diffFile: diffFile,
      isSameDimensions: diffData.isSameDimensions,
      dimensionDifference: diffData.dimensionDifference,
      misMatchPercentage: diffData.misMatchPercentage,
      analysisTime: diffData.analysisTime
    }), (err, data) => {
      console.log(err, data)
    })
  })
}

function generateDiffs() {
  // Make the directory in case it doesn't exist.
  spawn('mkdir', [config.diffDir])

  getScreenshots(config.originalDir).then((screenshots) => {
    screenshots.forEach((file1) => {
      // Read source
      fs.readFile(file1, (err, data) => {
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

function getScreenshots(dir) {
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

function generatePreview() {
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
      config,
    })

    fs.writeFile(`${config.diffDir}/diff-preview.html`, html, 'utf-8', (err, data) => {
      console.log(err, data)
    })
  }).catch((e) => {
    console.log(e)
  })
}


module.exports = {
  copyToOriginal: copyToOriginal,
  diffFiles: diffFiles,
  generateDiffs: generateDiffs,
  generatePreview: generatePreview,
  validateJson: validateJson,
}

// const pargs = process.argv
// const diffDir = './test/screenshots-diff/'
//
// const srcImgs = pargs[2]
// const compareImgs = pargs[3]
//
// function removePattern (str) {
//   return str.split('*.png').join('')
// }
//
// function renameExt (str, ext1, ext2) {
//   return str.split(ext1).join(ext2)
// }
//
// globby(srcImgs).then((files) => {
//   files.forEach((file1) => {
//     // Read source
//     fs.readFile(file1, (err, data) => {
//       // Read new
//       const srcPng = PNG.sync.read(data)
//       const file2 = file1.replace(removePattern(srcImgs), removePattern(compareImgs))
//       const diffFile = file1.replace(removePattern(srcImgs), diffDir)
//       console.log(diffFile)
//       fs.readFile(file2, (err2, data2) => {
//         resemble(file1).compareTo(file2).onComplete(function (diffData) {
//           console.log(diffData)
//           if (diffData.misMatchPercentage === '0.00') {
//             // console.log(`PASS: ${file1} matched ${file2}`)
//           } else {
//             // console.log(`FAIL: ${file1} did not match ${file2}`)
//             const diffImg = diffData.getDiffImage().pack().pipe(fs.createWriteStream(diffFile))
//
//             // Write summary file.
//             fs.writeFile(renameExt(diffFile, '.png', '.json'), JSON.stringify({
//               diffFile: diffFile,
//               isSameDimensions: diffData.isSameDimensions,
//               dimensionDifference: diffData.dimensionDifference,
//               misMatchPercentage: diffData.misMatchPercentage,
//               analysisTime: diffData.analysisTime
//             }), 'utf-8', (err, data) => {
//               console.log(err, data)
//             })
//           }
//         })
//         // var diff = new PNG({width: srcPng.width, height: srcPng.height});
//         // pixelmatch(data, data2, diff.data, srcPng.width, srcPng.height)
//         // console.log(diff.data);
//         // diff.pack().pipe(fs.createWriteStream(diffFile));
//       })
//     })
//   })
// }).catch((e) => {
//   console.log(e)
// })
//
// // pixelmatch(img1, img2, diff, 800, 600, {threshold: 0.1})
