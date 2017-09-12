const path = require('path')



function previewTemplate (props) {
  function getScreenshotName (file) {
    return file.split(`${props.config.originalDir}/`).join('')
      .split('.png').join('')
  }

  function makeIcon (props2) {
    return `<span class="icon ${props2.good ? 'green' : 'red'}">${props2.good ? '✔' : '✖'}</span>`
  }

  function makeRow (props2) {
    return `
  <div class="">
    <h4 id="${getScreenshotName(props2.file)}">${makeIcon({ good: props2.verboseOutput[props2.file].misMatchPercentage === '0.00' })}${getScreenshotName(props2.file)}</h4>
    <img class="screenshot w-30 src" src="file://${path.join(props2.pwd, props2.file)}" />
    <img class="screenshot w-30 new" src="file://${path.join(props2.pwd, props2.file.replace(props2.config.originalDir, props2.config.newDir))}" />
    <img class="screenshot w-30 diff" src="file://${path.join(props2.pwd, props2.file.replace(props2.config.originalDir, props2.config.diffDir))}" />
  </div>
  `
  }

  function makeTocSummary(props2) {
    let failCount = 0
    let passCount = 0
    let verboseOutput = []
    let html = `${props2.files.map((file) => {
      console.log(file);
      if (props2.verboseOutput[file].misMatchPercentage !== '0.00') {
        failCount++
        verboseOutput.push(props2.verboseOutput[file])
      } else {
        passCount++
      }
      return `<div><a href="#${getScreenshotName(file)}">${makeIcon({ good: props2.verboseOutput[file].misMatchPercentage === '0.00' })}${getScreenshotName(file)}</a></div>`
    }).join('')}`
    const summary = `<h3>Screendiff Tests: <span class="red">${failCount} failed</span>, <span class="green">${passCount} passed</span>, ${props2.files.length} total</h3><pre style="display: none;">${JSON.stringify(verboseOutput, null, 2)}</pre><br />`

    return html + summary
  }

  return `
<html>
  <head>
    <title>screendiff preview</title>
    <style>
      html {
        font-family: sans-serif;
      }
      a {
        text-decoration: none;
      }

      .dib {
        display: inline-block;
      }
      .w-30 {
        width: 30%;
      }
      .center {
        margin: 0 auto;
      }
      .tc {
        text-align: center;
      }
      .b {
        font-weight: bold;
      }
      .o-40 {
        opacity: .4;
      }

      .screenshot {
        /*position: absolute;*/
        margin-bottom: 40px;
      }

      .screenshot:first-child {
        // opacity: 0.3;
      }

      .icon {
        margin-right: 0.5em;
      }
      .red {
        color: #ff4136;
      }
      .green {
        color: #19a974;
      }
    </style>
  </head>
  <body>
    <h1 style="margin: 30px 0;">Screendiff Preview</h1>
    <div>
      ${makeTocSummary({
        pwd: props.pwd,
        files: props.files,
        config: props.config,
        verboseOutput: props.verboseOutput,
      })}
    </div>
    <br />
    <div>
      <span class="w-30 dib o-40 tc b">ORIGINAL</span>
      <span class="w-30 dib o-40 tc b">NEW</span>
      <span class="w-30 dib o-40 tc b">DIFF</span>
      ${props.files.map((file) => {
        return {
          pwd: props.pwd,
          file,
          config: props.config,
          verboseOutput: props.verboseOutput,
        }
      }).map(makeRow).join('')}
    </div>
  </body>
</html>
`
}

module.exports = {
  previewTemplate: previewTemplate,
}
