'use strict'

const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const expect = require('@hapi/code').expect

lab.experiment('server', () => {
  lab.before(async () => {
    require('dotenv').config()
    const { createServer, startServer } = require('./server')
    //this.server = await createServer()
    this.server = await startServer([], createServer(), false)
  })

  lab.test('it uses HOST and PORT from env', async () => {
    expect(this.server.settings.host).to.equal(process.env.HOST)
    expect(this.server.settings.port).to.equal(parseInt(process.env.PORT))
  })

  lab.test('it has logger plugin', async () => {
    expect(this.server.registrations['hapi-pino']).to.not.equal(undefined)
    expect(this.server.logger).to.not.equal(undefined)
  })
  
  lab.test('it has auth plugin', async () => {
    // TODO other auth assertions for env vars
    expect(this.server.registrations['hapi-auth-jwt2']).to.not.equal(undefined)
  })

  lab.test('it throws an error if startServer fails to start', async () => {
    require('dotenv').config()
    const { createServer } = require('./server')

    try {
      const server = await createServer()
    } catch (err) {
      expect(err).to.not.equal(undefined)
    }
  })

})
