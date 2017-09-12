
const util = require('../util.js')

test('util.getDefaults', () => {
  const defaults = util.getDefaults({})
  expect(defaults).toMatchSnapshot()
});
