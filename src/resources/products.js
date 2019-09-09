'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema
const Router = require('../Router')

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  }
}, { collection: 'products' })

ProductSchema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', ProductSchema)
const ProductRouter = new Router(Product, '/products')

ProductRouter.makePublic(['get', 'getOne'])
ProductRouter.makePrivate(['post', 'put', 'patch', 'delete'])

module.exports = { Product, ProductRouter }
