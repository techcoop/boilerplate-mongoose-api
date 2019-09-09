'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema
const Router = require('../Router')

const UserProductSchema = new Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  _product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
}, { collection: 'user_products' })

UserProductSchema.plugin(mongoosePaginate)

const UserProduct = mongoose.model('UserProduct', UserProductSchema)
const UserProductRouter = new Router(UserProduct, '/users/{_user}/products')

UserProductRouter.makePrivate(['get', 'getOne', 'post', 'put', 'patch', 'delete'])

module.exports = { UserProduct, UserProductRouter }
