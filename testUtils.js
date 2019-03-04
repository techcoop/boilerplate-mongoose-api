'use strict'

const mongoose = require('mongoose')
const MongoMemoryServer = require('mongodb-memory-server').default
const hapi = require('hapi')

let mongoServer
const mockDB = async () => {
  if (mongoServer) {
    return
  }
  
  mongoServer = new MongoMemoryServer()
  const uri = await mongoServer.getConnectionString()
  await mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false })
  
  // TODO might have issue with connection timeout?? add reconnect like in:
  // https://github.com/nodkz/mongodb-memory-server
}

const server = () => {
  return hapi.server({
    host: 'localhost',
    port: 8000
  })
}

const h = (params) => {
  return Object.assign(
    {code: (statusCode) => Object.assign({ statusCode }, params)},
    params
  )
}

module.exports = { mockDB, server, h }
