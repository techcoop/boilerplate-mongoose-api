'use strict'

const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const expect = require('Code').expect
const { mockDB, h } = require('../testUtils')

const Router = require('./Router')
const { User } = require('./resources/users')

lab.experiment('Router', () => {
  lab.before(async () => {
    mockDB()
  })

  lab.test('it takes a Model, path parameters, and default types', async () => {
    const Model = new Object()
    const path = '/test'
    const router = new Router(Model, path)
    const types = ['get', 'getOne', 'post', 'put', 'patch', 'delete']

    expect(router.Model).to.equal(Model)
    expect(router.path).to.equal(path)
    expect(Object.keys(router._types)).to.equal(types)
  })

  lab.test('it accepts types in the constructor', async () => {
    const types = ['get']
    const router = new Router(null, null, types)
    expect(Object.keys(router._routes)).to.equal(types)
  })

  lab.test('it hydrates a payload with url params', async () => {
    const payload = { payloadVar: 'payloadVar' }
    const params = { paramsVar: 'paramsVar' }
    const MockModel = { schema: { paths: { paramsVar: true } } }

    const router = new Router(MockModel, '/test')

    const hyrdated = router.hydratePayload(payload, params)
    expect(hyrdated.payloadVar).to.equal(payload.payloadVar)
    expect(hyrdated.paramsVar).to.equal(params.paramsVar)
  })

  lab.test('it assigns handler functions and methods to _types', async () => {
    const path = '/test'
    const router = new Router(User, path)

    expect(router._types['get'].method).to.equal('GET')
    expect(router._types['get'].path).to.equal(`${path}`)
    expect(router._types['get'].config.handler.name).to.equal('bound getListHandler')

    expect(router._types['getOne'].method).to.equal('GET')
    expect(router._types['getOne'].path).to.equal(`${path}/{id}`)
    expect(router._types['getOne'].config.handler.name).to.equal('bound getOneHandler')

    expect(router._types['post'].method).to.equal('POST')
    expect(router._types['post'].path).to.equal(`${path}`)
    expect(router._types['post'].config.handler.name).to.equal('bound postHandler')

    expect(router._types['put'].method).to.equal('PUT')
    expect(router._types['put'].path).to.equal(`${path}/{id}`)
    expect(router._types['put'].config.handler.name).to.equal('bound putHandler')

    expect(router._types['patch'].method).to.equal('PATCH')
    expect(router._types['patch'].path).to.equal(`${path}/{id}`)
    expect(router._types['patch'].config.handler.name).to.equal('bound patchHandler')

    expect(router._types['delete'].method).to.equal('DELETE')
    expect(router._types['delete'].path).to.equal(`${path}/{id}`)
    expect(router._types['delete'].config.handler.name).to.equal('bound deleteHandler')
  })

  lab.test('it returns a list of models when getListHandler is called', async () => {
    const router = new Router(User)
    const requestMock = { query: {} }
    
    const userModel = await new User({ subs: 'before123' }).save()

    const list = await router.getListHandler(requestMock)
    expect(list[0].subs[0]).to.equal('before123')

    await userModel.remove()
  })

  lab.test('it returns a model when getOneHandler is called', async () => {
    const router = new Router(User)

    const userModel = await new User({ subs: 'before123' }).save()

    const user = await router.getOneHandler({ params: { id: userModel._id.toString() } })
    expect(user).to.not.equal(null)

    await userModel.remove()
  })

  lab.test('it creates a model when postHandler is called', async () => {
    const router = new Router(User)
    const sub = 'postHandler123'
    const requestMock = { payload: { subs: sub }, params:  {} }
    const helperMock = { response: h }
    const user = await router.postHandler(requestMock, helperMock)

    expect(user.statusCode).to.equal(201)
    expect(user._doc.subs[0]).to.equal(sub)

    await User.findByIdAndDelete(user._doc._id)
  })

  lab.test('it update a model when putHandler is called', async () => {
    const user = await new User({ subs: 'putHandler123' }).save()

    const router = new Router(User)
    const requestMock = { payload: { subs: 'puthandler456' }, params: { id: user._id.toString() } }
    const updatedUser = await router.putHandler(requestMock)

    expect(updatedUser.subs[0]).to.equal('puthandler456')

    await user.remove()
  })

  lab.test('it update a model when patchHandler is called', async () => {
    const user = await new User({ subs: 'patchHandler123' }).save()

    const router = new Router(User)
    const requestMock = { payload: { subs: 'patchHandler456' }, params: { id: user._id.toString() } }
    const updatedUser = await router.patchHandler(requestMock)

    expect(updatedUser.subs[0]).to.equal('patchHandler456')

    await user.remove()
  })

  lab.test('it update a model when deleteHandler is called', async () => {
    const user = await new User({ subs: 'deleteHandler123' }).save()

    const router = new Router(User)
    const requestMock = { params: { id: user._id.toString() } }
    const helperMock = { response: h }
    const deletedUser = await router.deleteHandler(requestMock, helperMock)
    expect(deletedUser.statusCode).to.equal(204)
  })

  lab.test('it sets auth to false when makeRoutePublic is called', async () => {
    const router = new Router(User, '/test', ['get'])
    router.makeRoutePublic('get')
    const auth = router._routes['get'].config.auth
    expect(auth).to.equal(false)
  })

  lab.test('it sets auth to auth0_jwk when makeRoutePrivate is called', async () => {
    const router = new Router(User, '/test', ['get'])
    router.makeRoutePrivate('get')
    const auth = router._routes['get'].config.auth
    expect(auth).to.equal('auth0_jwk')
  })

  lab.test('it sets auth with scope and strategy when makeRouteScoped is called', async () => {
    const router = new Router(User, '/test', ['get'])
    router.makeRouteScoped('get', ['test:read'])
    const auth = router._routes['get'].config.auth
    expect(auth.strategy).to.equal('auth0_jwk')
    expect(auth.scope).to.equal(['test:read'])
  })

  lab.test('it sets auth to false when makePublic is called with many routes', async () => {
    const router = new Router(User, '/test', ['get', 'getOne'])
    router.makePublic(['get', 'getOne'])
    const authGet = router._routes['get'].config.auth
    expect(authGet).to.equal(false)
    const authGetOne = router._routes['getOne'].config.auth
    expect(authGetOne).to.equal(false)
  })

  lab.test('it sets auth to false when makePrivate is called with many routes', async () => {
    const router = new Router(User, '/test', ['get', 'getOne'])
    router.makePrivate(['get', 'getOne'])
    const authGet = router._routes['get'].config.auth
    expect(authGet).to.equal('auth0_jwk')
    const authGetOne = router._routes['getOne'].config.auth
    expect(authGetOne).to.equal('auth0_jwk')
  })

  lab.test('it sets auth with scope and strategy when makeScoped is called with many routes', async () => {
    const router = new Router(User, '/test', ['get', 'getOne'])
    router.makeScoped(['get', 'getOne'], ['test:read', 'test:readOne'])

    const authGet = router._routes['get'].config.auth
    expect(authGet.strategy).to.equal('auth0_jwk')
    expect(authGet.scope).to.equal(['test:read', 'test:readOne'])

    const authGetOne = router._routes['get'].config.auth
    expect(authGetOne.strategy).to.equal('auth0_jwk')
    expect(authGetOne.scope).to.equal(['test:read', 'test:readOne'])
  })

  lab.test('it sets a route on the router when passed to route', async () => {
    const router = new Router(User, '/test', [])
    const handler = () => {}
    const routerItem = {
      method: 'TEST',
      path: '/test/123',
      config: {
        handler: handler
      }
    }

    router.route('get', routerItem)
    expect(router._routes['get'].method).to.equal(routerItem.method)
    expect(router._routes['get'].path).to.equal(routerItem.path)
    expect(router._routes['get'].config.handler).to.equal(handler)
  })

  lab.test('it returns all routes when routes is called', async () => {
    const router = new Router(User, '/test', ['get'])
    const routes = router.routes()
    
    expect(routes[0].method).to.equal('GET')
    expect(routes[0].path).to.equal('/test')
    expect(routes[0].config.handler.name).to.equal('bound getListHandler')
  })
})
