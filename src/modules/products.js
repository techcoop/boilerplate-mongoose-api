'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaStatics = require('../helpers/SchemaStatics')
const Router = require('../helpers/Router')

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

ProductSchema.statics = Object.assign({}, SchemaStatics)

const Product = mongoose.model('Product', ProductSchema)
const ProductRouter = new Router(Product, '/products')

ProductRouter.makePrivate(['post', 'put', 'patch', 'delete'])

module.exports = { Product, ProductRouter }
