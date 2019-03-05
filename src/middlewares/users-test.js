'use strict'

const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const expect = require('Code').expect
const { mockDB, h } = require('../../testUtils')

const { validateUser } = require('./users')
const { User } = require('../resources/users')

lab.experiment('validateUser', async () => {
  lab.before(async () => {
    await mockDB()
  })

  lab.test('it returns invalid if no decoded and no sub', async () => {
    const invalidUser1 = await validateUser()
    expect(invalidUser1.isValid).to.equal(false)

    const invalidUser2 = await validateUser({})
    expect(invalidUser2.isValid).to.equal(false)
  })

  lab.test('it creates a user when sub does not exist and fetches the user when it does', async () => {
    const sub = 'usertest:123'
    const scope = 'test fff'

    const validated1 = await validateUser({ sub, scope, extra: 123 }, {})
    expect(validated1.isValid).to.equal(true)
    expect(validated1.credentials.sub).to.equal(sub)
    expect(validated1.credentials.scope).to.equal(['test', 'fff'])
    expect(validated1.credentials.extra).to.equal(123)
    expect(validated1.credentials._id).to.not.equal(undefined)

    const validated2 = await validateUser({ sub }, {})
    expect(validated2.isValid).to.equal(true)
    expect(validated2.credentials.sub).to.equal(sub)
    expect(validated2.credentials._id).to.not.equal(undefined)
    expect(validated2.credentials._id).to.equal(validated1.credentials._id)

    await User.findByIdAndDelete(validated1.credentials._id)
  })

  lab.test('it returns a 401 response when the _user param does not match', async () => {
    const sub = 'usertest:456'

    const requestMock = { params: { _user: '123' } }
    const helperMock = { response: h }

    const validated1 = await validateUser({ sub }, requestMock, helperMock)
    expect(validated1.isValid).to.equal(false)
    expect(validated1.response.statusCode).to.equal(401)
    expect(validated1.response.message).to.equal('Invalid ownership of resource')

    await User.findOne({ subs: sub }).deleteOne()
  })
})
