'use strict'

const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const expect = require('Code').expect
const { mockDB, server } = require('../../testUtils')

const { Product, ProductRouter } = require('./products')

ProductRouter.makePublic(['post', 'put', 'patch', 'delete'])

lab.experiment('Products module', async () => {
  lab.before(async () => {
    await mockDB()
  })

  lab.test('gets products on GET /products', async () => {
    const testServer = server()
    testServer.route(ProductRouter.routes())

    const product = await new Product({
      name: 'Get Product',
      price: 100.00,
      description: 'Get Product Description'
    }).save()

    const response = await testServer.inject({ method: 'GET', url: `/products` })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(Array.isArray(payload)).to.equal(true)
    expect(payload[0].name).to.equal(product.name)
    expect(payload[0].price).to.equal(product.price)
    expect(payload[0].description).to.equal(product.description)

    product.remove()
  })

  lab.test('creates products on POST /products', async () => {
    const testServer = server()
    testServer.route(ProductRouter.routes())
    
    const payloadData = {
      name: 'Post Product',
      price: 111.00,
      description: 'Post Product Description'
    }

    const response = await testServer.inject({ method: 'POST', url: `/products`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(201)
    expect(payload.name).to.equal(payloadData.name)
    expect(payload.price).to.equal(payloadData.price)
    expect(payload.description).to.equal(payloadData.description)

    await Product.findByIdAndDelete(payload._id)
  })

  lab.test('updates products on PUT /products', async () => {
    const testServer = server()
    testServer.route(ProductRouter.routes())
    
    const product = await new Product({
      name: 'Put Product',
      price: 100.00,
      description: 'Put Product Description'
    }).save()

    const payloadData = {
      name: 'Put Product 2',
      price: 222.00,
      description: 'Put Product Description 2'
    }

    const response = await testServer.inject({ method: 'PUT', url: `/products/${product._id}`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(payload.name).to.equal(payloadData.name)
    expect(payload.price).to.equal(payloadData.price)
    expect(payload.description).to.equal(payloadData.description)

    await product.remove()
  })

  lab.test('updates products on PATCH /products', async () => {
    const testServer = server()
    testServer.route(ProductRouter.routes())
    
    const product = await new Product({
      name: 'Patch Product',
      price: 100.00,
      description: 'Patch Product Description'
    }).save()

    const payloadData = {
      name: 'Patch Product 2',
      price: 333.00,
      description: 'Patch Product Description 2'
    }

    const response = await testServer.inject({ method: 'PATCH', url: `/products/${product._id}`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(payload.name).to.equal(payloadData.name)
    expect(payload.price).to.equal(payloadData.price)
    expect(payload.description).to.equal(payloadData.description)

    await product.remove()
  })

  lab.test('deletes products on DELETE /products', async () => {
    const testServer = server()
    testServer.route(ProductRouter.routes())
    
    const product = await new Product({
      name: 'Delete Product',
      price: 100.00,
      description: 'Delete Product Description'
    }).save()

    const response = await testServer.inject({ method: 'DELETE', url: `/products/${product._id}` })
    const deleted = await Product.findById(product._id).exec()
    expect(response.statusCode).to.equal(204)
    expect(deleted).to.equal(null)
  })
})
