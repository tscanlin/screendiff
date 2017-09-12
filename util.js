const schema = require('./apiSchema.json')

function getDefaults(config) {
  if (!schema.properties || !config) {
    throw new Error('Pass a valid schema and config')
  }

  Object.keys(schema.properties).forEach((prop) => {
    console.log(prop);
    config[prop] = config[prop] || schema.properties[prop].default
  })

  return config
}
exports.getDefaults = getDefaults
