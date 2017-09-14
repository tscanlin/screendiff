const util = require('../util.js')
const index = require('../index.js')

test('util.getDefaults', () => {
  const defaults = util.getDefaults({})
  expect(defaults).toMatchSnapshot()
})

test('index.generateDiffs', () => {
  index.generateDiffs()
  expect(true).toBe(true)
})
