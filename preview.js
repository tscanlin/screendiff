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
    const originalFile = `file://${path.join(props2.pwd, props2.file)}`
    const newFile = `file://${path.join(props2.pwd, props2.file.replace(props2.config.originalDir, props2.config.newDir))}`
    const diffFile = `file://${path.join(props2.pwd, props2.file.replace(props2.config.originalDir, props2.config.diffDir))}`
    const file = props2.file
    const misMatchPercentage = props2.verboseOutput && props2.verboseOutput[file] && props2.verboseOutput[file].misMatchPercentage

    return `
  <div>
    <h4 id="${getScreenshotName(props2.file)}">${makeIcon({ good: misMatchPercentage === '0.00' })}${getScreenshotName(props2.file)}</h4>
    <div class="df w-100">
      <a href="${originalFile}" class="screenshot flex-1 pa2">
        <img class="original" src="${originalFile}" />
      </a>
      <a href="${newFile}" class="screenshot flex-1 pa2">
        <img class="new" src="${newFile}" />
      </a>
      <a href="${diffFile}" class="screenshot flex-1 pa2">
        <img class="diff" src="${diffFile}" />
      </a>
    </div>
  </div>
  `
  }

  function makeTocSummary (props2) {
    let failCount = 0
    let passCount = 0
    let verboseOutput = []
    let html = `${props2.files.map((file) => {
      const misMatchPercentage = props2.verboseOutput && props2.verboseOutput[file] && props2.verboseOutput[file].misMatchPercentage
      if (misMatchPercentage !== '0.00') {
        failCount++
        verboseOutput.push(props2.verboseOutput[file])
      } else {
        passCount++
      }
      return `<div><a href="#${getScreenshotName(file)}">${makeIcon({ good: misMatchPercentage === '0.00' })}${getScreenshotName(file)}</a></div>`
    }).join('')}`
    const summary = `<h3>picdiff Tests: <span class="red">${failCount} failed</span>, <span class="green">${passCount} passed</span>, ${props2.files.length} total</h3><pre style="display: none;">${JSON.stringify(verboseOutput, null, 2)}</pre>`

    return summary + html
  }

  return `
<html>
  <head>
    <title>picdiff preview</title>
    <style>
      html { font-family: sans-serif; background-color: #fafcfd; margin-bottom: 50vh; }
      a { text-decoration: none; }
      img { max-width:100%; }

      .dib {
        display: inline-block;
      }
      .df {
        display: flex;
      }
      .flex-1 {
        flex: 1;
      }
      .flex-none {
        flex: 0;
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
      .w-100 {
        width: 100%;
      }
      .pa2 {
        padding: 1rem;
      }

      .screenshot {
        margin-bottom: 40px;
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

      #original:not(:checked) ~ .screenshot-container .screenshot-label:nth-child(1) {
        display: none;
      }
      #original:not(:checked) ~ .screenshot-container .screenshot:nth-child(1) {
        display: none;
      }
      #new:not(:checked) ~ .screenshot-container .screenshot-label:nth-child(2) {
        display: none;
      }
      #new:not(:checked) ~ .screenshot-container .screenshot:nth-child(2) {
        display: none;
      }
      #diff:not(:checked) ~ .screenshot-container .screenshot-label:nth-child(3) {
        display: none;
      }
      #diff:not(:checked) ~ .screenshot-container .screenshot:nth-child(3) {
        display: none;
      }
    </style>
  </head>
  <body>
    <h1 style="margin: 30px 0;">picdiff Preview</h1>
    <div>
      ${makeTocSummary({
        pwd: props.pwd,
        files: props.files,
        config: props.config,
        verboseOutput: props.verboseOutput
      })}
    </div>
    <br />
    <h4>Controls</h4>
    <input id="original" type="checkbox" checked />
    <label for="original">ORIGINAL</label>
    &nbsp;
    <input id="new" type="checkbox" checked />
    <label for="new">NEW</label>
    &nbsp;
    <input id="diff" type="checkbox" checked />
    <label for="diff">DIFF</label>
    <br /><br /><br />
    <div class="screenshot-container">
      <div class="df">
        <div class="screenshot-label flex-1 o-40 tc b">ORIGINAL</div>
        <div class="screenshot-label flex-1 o-40 tc b">NEW</div>
        <div class="screenshot-label flex-1 o-40 tc b">DIFF</div>
      </div>
      ${props.files.map((file) => {
        return {
          pwd: props.pwd,
          file,
          config: props.config,
          verboseOutput: props.verboseOutput
        }
      }).map(makeRow).join('')}
    </div>
  </body>
</html>
`
}

module.exports = {
  previewTemplate: previewTemplate
}
