'use strict'

const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const expect = require('Code').expect
const { mockDB, server } = require('../../testUtils')

const { User, UserRouter } = require('./users')

UserRouter.makePublic(['get', 'getOne', 'post', 'put', 'patch', 'delete'])

lab.experiment('Users module', async () => {
  lab.before(async () => {
    await mockDB()
  })
  
  lab.test('gets users on GET /users', async () => {
    const testServer = server()
    testServer.route(UserRouter.routes())

    const user = await new User({
      subs: ['getsub:123']
    }).save()

    const response = await testServer.inject({ method: 'GET', url: `/users` })
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(Array.isArray(payload)).to.equal(true)
    expect(payload[0].subs[0]).to.equal(user.subs[0])

    await user.remove()
  })

  lab.test('creates users on POST /users', async () => {
    const testServer = server()
    testServer.route(UserRouter.routes())
    
    const payloadData = {
      subs: ['postsub:123']
    }

    const response = await testServer.inject({ method: 'POST', url: `/users`, payload: payloadData })
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(201)
    expect(payload.subs[0]).to.equal(payloadData.subs[0])

    await User.findByIdAndDelete(payload._id)
  })

  lab.test('updates users on PUT /users', async () => {
    const testServer = server()
    testServer.route(UserRouter.routes())
    
    const user = await new User({
      subs: ['putsub:123']
    }).save()

    const payloadData = {
      subs: ['putsub:456']
    }

    const response = await testServer.inject({ method: 'PUT', url: `/users/${user._id}`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(payload.subs[0]).to.equal(payloadData.subs[0])

    await user.remove()
  })

  lab.test('updates users on PATCH /users', async () => {
    const testServer = server()
    testServer.route(UserRouter.routes())
    
    const user = await new User({
      subs: ['patchsub:123']
    }).save()

    const payloadData = {
      subs: ['patchsub:456']
    }

    const response = await testServer.inject({ method: 'PATCH', url: `/users/${user._id}`, payload: payloadData })
    const payload = JSON.parse(response.payload)
    
    expect(response.statusCode).to.equal(200)
    expect(payload.subs[0]).to.equal(payloadData.subs[0])

    await user.remove()
  })
  
  lab.test('deletes users on DELETE /users', async () => {
    const testServer = server()
    testServer.route(UserRouter.routes())
    
    const user = await new User({
      subs: ['deletesub:123']
    }).save()

    const response = await testServer.inject({ method: 'DELETE', url: `/users/${user._id}` })
    const deleted = await User.findById(user._id).exec()
    expect(response.statusCode).to.equal(204)
    expect(deleted).to.equal(null)
  })
})
