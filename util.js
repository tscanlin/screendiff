const schema = require('./schema.json')

function getDefaults (config) {
  if (!schema.properties || !config) {
    throw new Error('Pass a valid schema and config')
  }

  Object.keys(schema.properties).forEach((prop) => {
    config[prop] = config[prop] || schema.properties[prop].default
  })

  return config
}

exports.getDefaults = getDefaults
