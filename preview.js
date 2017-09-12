const path = require('path')

function getSrc (str) {
  return str.split('screenshots-diff').join('screenshots-src')
}
function getNew (str) {
  return str.split('screenshots-diff').join('screenshots-new')
}

exports.diffPreviewTemplate = function diffPreviewTemplate (props) {
  console.log(props)

  function makeRow (props) {
    return `
  <div class="">
    <img class="screenshot src" src="file://${getSrc(path.join(props.pwd, props.file))}" />
    <img class="screenshot new" src="file://${getNew(path.join(props.pwd, props.file))}" />
    <img class="screenshot diff" src="file://${path.join(props.pwd, props.file)}" />
  </div>
  `
  }

  return `
<html>
  <head>
    <title>screendiff preview</title>
    <style>
      .screenshot {
        width: 300px;
        /*position: absolute;*/
      }

      .screenshot:first-child {
        opacity: 0.3;
      }
    </style>
  </head>
  <body>
    <h1>screendiff preview page</h1>
    <div>
      ${props.files.map((file) => {
        return {
          pwd: props.pwd,
          file: file
        }
      }).map(makeRow)}
    </div>
  </body>
</html>
`
}
