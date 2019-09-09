'use strict'

const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const expect = require('@hapi/code').expect
const { mockDB, server } = require('../../testUtils')

const { UserProduct, UserProductRouter } = require('./usersProducts')
const { User } = require('./users')
const { Product } = require('./products')

UserProductRouter.makePublic(['get', 'getOne', 'post', 'put', 'patch', 'delete'])

lab.experiment('UserProducts module', async () => {
  lab.before(async () => {
    await mockDB()

    this.user = await new User().save()
    this.product = await new Product({ name: 'Test', price: 10.00 }).save()
  })
  
  lab.test('gets the products for a user on GET /users/{_user}/products', async () => {
    const testServer = server()
    testServer.route(UserProductRouter.routes())

    const userProduct = await new UserProduct({
      _user: this.user._id,
      _product: this.product._id,
      price: 10.00,
      quantity: 2,
      total: 20.00
    }).save()

    const response = await testServer.inject({ method: 'GET', url: `/users/${this.user._id}/products` })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(Array.isArray(payload)).to.equal(true)
    expect(payload[0]._user).to.equal(userProduct._user.toString())
    expect(payload[0]._product).to.equal(userProduct._product.toString())
    expect(payload[0].price).to.equal(userProduct.price)
    expect(payload[0].quantity).to.equal(userProduct.quantity)
    expect(payload[0].total).to.equal(userProduct.total)

    userProduct.remove()
  })

  lab.test('creates products for a users on POST /users/{_user}/products', async () => {
    const testServer = server()
    testServer.route(UserProductRouter.routes())
    
    const payloadData = {
      _product: this.product._id,
      price: 10.00,
      quantity: 2,
      total: 20.00
    }

    const response = await testServer.inject({ method: 'POST', url: `/users/${this.user._id}/products`, payload: payloadData })
    const payload = JSON.parse(response.payload)
 
    expect(response.statusCode).to.equal(201)
    expect(payload._user).to.equal(this.user._id.toString())
    expect(payload._product).to.equal(this.product._id.toString())
    expect(payload.price).to.equal(payloadData.price)
    expect(payload.quantity).to.equal(payloadData.quantity)
    expect(payload.total).to.equal(payloadData.total)

    await UserProduct.findByIdAndDelete(payload._id)
  })

  lab.test('updates a product on a user PUT /users/{_user}/products', async () => {
    const testServer = server()
    testServer.route(UserProductRouter.routes())
    
    const userProduct = await new UserProduct({
      _user: this.user._id,
      _product: this.product._id,
      price: 10.00,
      quantity: 2,
      total: 20.00
    }).save()

    const payloadData = {
      quantity: 3,
      total: 30.00
    }

    const response = await testServer.inject({ method: 'PUT', url: `/users/${this.user._id}/products/${userProduct._id}`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(payload.quantity).to.equal(payloadData.quantity)
    expect(payload.total).to.equal(payloadData.total)

    userProduct.remove()
  })

  lab.test('updates users on PATCH /users/{_user}/products', async () => {
    const testServer = server()
    testServer.route(UserProductRouter.routes())
    
    const userProduct = await new UserProduct({
      _user: this.user._id,
      _product: this.product._id,
      price: 10.00,
      quantity: 2,
      total: 20.00
    }).save()

    const payloadData = {
      quantity: 3,
      total: 30.00
    }

    const response = await testServer.inject({ method: 'PATCH', url: `/users/${this.user._id}/products/${userProduct._id}`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(payload.quantity).to.equal(payloadData.quantity)
    expect(payload.total).to.equal(payloadData.total)

    userProduct.remove()
  })
  
  lab.test('deletes users on DELETE /users/{_user}/products', async () => {
    const testServer = server()
    testServer.route(UserProductRouter.routes())
    
    const userProduct = await new UserProduct({
      _user: this.user._id,
      _product: this.product._id,
      price: 10.00,
      quantity: 2,
      total: 20.00
    }).save()

    const response = await testServer.inject({ method: 'DELETE', url: `/users/${this.user._id}/products/${userProduct._id}` })
    const deleted = await UserProduct.findById(userProduct._id).exec()
    expect(response.statusCode).to.equal(204)
    expect(deleted).to.equal(null)
  })

  lab.after(async () => {
    await this.user.remove()
    await this.product.remove()
  })
})
