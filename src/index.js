'use strict'

require('./config')
const mongoose = require('mongoose')
const { createServer, startServer } = require('./server')

const server = createServer()

process.server = server

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })

const routes = [].concat(
  require('./resources/users').UserRouter.routes(),
  require('./resources/usersProducts').UserProductRouter.routes(),
  require('./resources/products').ProductRouter.routes()
)

const start = async () => {
  await startServer(routes, server)
  console.log('Server running at:', server.info.uri)
}

start()
