'use strict'

const joi = require('joi')

require('dotenv').config()

const configSchema = joi.object({
  NODE_ENV: joi.string().allow(['dev', 'test', 'stage', 'prod']),
  HOST: joi.string().required(),
  PORT: joi.number().required(),
  MONGO_URI: joi.string().required()
}).unknown()

const { error } = joi.validate(process.env, configSchema)
if (error) {
  throw new Error(`Config .env file has errors: \n${error.message}\n\n`)
}
