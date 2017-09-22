const util = require('../util.js')
const index = require('../index.js')

const failConfig = require('../picdiff-fail/config.js')

test('util.getDefaults', () => {
  const defaults = util.getDefaults({})
  expect(defaults).toMatchSnapshot()
})

describe('pass', () => {
  test('index.generateDiffs', (done) => {
    index.generateDiffs({}).then((data) => {
      // console.log(data)
      done()
    })
    // expect(() => {
    // }).not.toThrow()
  })

  test('index.validateJson', (done) => {
    index.validateJson().then((data) => {
      expect(data.passed).toBe(2)
      expect(data.failed).toBe(0)
      expect(data.succeded).toBe(true)
      done()
    })
  })
})

describe('fail', () => {
  test('index.generateDiffs', (done) => {
    console.log(failConfig)
    index.generateDiffs(failConfig).then((data) => {
      // console.log(data)
      done()
    })
    // expect(() => {
    // }).not.toThrow()
  })

  test('index.validateJson', (done) => {
    index.validateJson(failConfig).then((data) => {
      expect(data.passed).toBe(1)
      expect(data.failed).toBe(1)
      expect(data.succeded).toBe(false)
      done()
    })
  })
})
