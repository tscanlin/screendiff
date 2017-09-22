const util = require('../util.js')
const spawn = require('child_process').spawnSync
const globby = require('globby')

const picdiffConfig = require('../picdiff/config.js')
const picdiffFailConfig = require('../picdiff-fail/config.js')
// const failConfig = require('../picdiff-fail/config.js')

test('util.getDefaults', () => {
  const defaults = util.getDefaults({})
  expect(defaults).toMatchSnapshot()
})

describe('pass', () => {
  test('diff', (done) => {
    spawn('node', ['./cli.js', 'clean'])
    spawn('node', ['./cli.js', 'diff'])
    globby(`./${picdiffConfig.baseDir}/${picdiffConfig.diffDir}/*`).then((files) => {
      expect(files.length).toBe(4)
      done()
    })
  })

  test('clean', (done) => {
    spawn('node', ['./cli.js', 'clean'])
    globby(`./${picdiffConfig.baseDir}/${picdiffConfig.diffDir}/*`).then((files) => {
      expect(files.length).toBe(0)
      done()
    })
  })

  test('validate', (done) => {
    spawn('node', ['./cli.js', 'diff'])
    const res = spawn('node', ['./cli.js', 'validate'])
    expect(res.status).toBe(0)
    done()
  })
})

describe('fail', () => {
  test('diff', (done) => {
    spawn('node', ['./cli.js', 'clean', '--baseDir', 'picdiff-fail'])
    spawn('node', ['./cli.js', 'diff', '--baseDir', 'picdiff-fail'])
    globby(`./${picdiffFailConfig.baseDir}/${picdiffFailConfig.diffDir}/*`).then((files) => {
      expect(files.length).toBe(4)
      done()
    })
  })

  test('clean', (done) => {
    spawn('node', ['./cli.js', 'clean', '--baseDir', 'picdiff-fail'])
    globby(`./${picdiffFailConfig.baseDir}/${picdiffFailConfig.diffDir}/*`).then((files) => {
      expect(files.length).toBe(0)
      done()
    })
  })

  test('validate', (done) => {
    spawn('node', ['./cli.js', 'diff', '--baseDir', 'picdiff-fail'])
    const res = spawn('node', ['./cli.js', 'validate', '--baseDir', 'picdiff-fail'])
    expect(res.status).toBe(1)
    done()
  })
})
