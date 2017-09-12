const globby = require('globby')
const diffDir = './test/screenshots-diff/'

exports.validate = validate

function validate () {
  globby(`${diffDir}*.json`).then((files) => {
    console.log(files)
    let failCount = 0
    let passCount = 0
    let failureArr = []

    files.forEach((file) => {
      const json = require(`../.${file}`)
      if (json.misMatchPercentage !== '0.00') {
        failCount++
        failureArr.push(json)
      } else {
        passCount++
      }
      console.log(json)
    })

    throw new Error(`
Fail: ${failCount}, Pass: ${passCount}

Failures: ${JSON.stringify(failureArr, null, 2)}
`)
  }).catch((e) => {
    console.error(e)
  })
}

validate()
