const util = require('../util.js')
const spawn = require('child_process').spawnSync

test('util.getDefaults', () => {
  const defaults = util.getDefaults({})
  expect(defaults).toMatchSnapshot()
})

describe('pass', () => {
  test('diff', () => {
    const r = spawn('node', ['./cli.js', 'diff'])
    const res = JSON.parse(r.stdout.toString())
    expect(res.failed).toBe(0)
    expect(res.passed).toBe(2)
    expect(res.total).toBe(2)
  })

  test('validate', () => {
    spawn('node', ['./cli.js', 'diff'])
    const r = spawn('node', ['./cli.js', 'validate'])
    expect(r.status).toBe(0)
    const res = JSON.parse(r.stdout.toString())
    expect(res.failed).toBe(0)
    expect(res.passed).toBe(2)
    expect(res.total).toBe(2)
  })
})

describe('fail', () => {
  test('diff', () => {
    const r = spawn('node', ['./cli.js', 'diff', '--baseDir', 'picdiff-fail'])
    const res = JSON.parse(r.stdout.toString())
    expect(res.failed).toBe(1)
    expect(res.passed).toBe(1)
    expect(res.total).toBe(2)
  })

  test('validate', () => {
    spawn('node', ['./cli.js', 'diff', '--baseDir', 'picdiff-fail'])
    const r = spawn('node', ['./cli.js', 'validate', '--baseDir', 'picdiff-fail'])
    // Status is 1 because it throws an error.
    expect(r.status).toBe(1)
  })
})
