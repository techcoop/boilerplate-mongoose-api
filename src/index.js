'use strict'

require('./config')
const mongoose = require('mongoose')
const { createServer } = require('./server')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })

const routes = [].concat(
  require('./modules/users').UserRouter.routes(),
  require('./modules/usersProducts').UserProductRouter.routes(),
  require('./modules/products').ProductRouter.routes()
)

let server
const start = async () => {
  server = await createServer(routes)
  console.log('Server running at:', server.info.uri)
}

start()

module.exports = server
