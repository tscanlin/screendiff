const util = require('../util.js')
const index = require('../index.js')

const failConfig = require('../picdiff-fail/config.js')

test('util.getDefaults', () => {
  const defaults = util.getDefaults({})
  expect(defaults).toMatchSnapshot()
})

describe('pass', () => {
  test('index.generateDiffs', () => {
    expect(() => { index.generateDiffs() }).not.toThrow()
  })

  test('index.validateJson', (done) => {
    index.validateJson().then((data) => {
      expect(data.passCount).toBe(2)
      expect(data.failCount).toBe(0)
      expect(data.passed).toBe(true)
      done()
    })
  })
})

describe('fail', () => {
  test('index.generateDiffs', () => {
    expect(() => { index.generateDiffs(failConfig) }).not.toThrow()
  })

  test('index.validateJson', (done) => {
    index.validateJson(failConfig).then((data) => {
      expect(data.passCount).toBe(1)
      expect(data.failCount).toBe(1)
      expect(data.passed).toBe(false)
      done()
    })
  })
})
