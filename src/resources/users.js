'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SchemaStatics = require('../SchemaStatics')
const Router = require('../Router')

const UserSchema = new Schema({
  subs: [{
    type: String,
    required: true
  }]
}, { collection: 'users' })

UserSchema.statics = Object.assign({}, SchemaStatics)

const User = mongoose.model('User', UserSchema)
const UserRouter = new Router(User, '/users')

UserRouter.makeScoped(['get', 'getOne', 'post', 'put', 'patch', 'delete'], ['admin:users'])

module.exports = { User, UserRouter }
