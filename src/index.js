'use strict'

require('./config')
const mongoose = require('mongoose')
const { server, startServer } = require('./server')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })

const routes = [].concat(
  require('./modules/users').UserRouter.routes(),
  require('./modules/usersProducts').UserProductRouter.routes(),
  require('./modules/products').ProductRouter.routes()
)



startServer(routes)
