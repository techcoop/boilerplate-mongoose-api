'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema
const Router = require('../Router')

const UserSchema = new Schema({
  subs: [{
    type: String,
    required: true
  }]
}, { collection: 'users' })

UserSchema.plugin(mongoosePaginate)

const User = mongoose.model('User', UserSchema)
const UserRouter = new Router(User, '/users')

UserRouter.makeScoped(['get', 'getOne', 'post', 'put', 'patch', 'delete'], ['admin:users'])

module.exports = { User, UserRouter }
