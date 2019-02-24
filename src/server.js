'use strict'

const hapi = require('hapi')
const jwksRsa = require('jwks-rsa')
const validateUser = require('./utils/users').validateUser

const server = hapi.server({
  host: process.env.HOST,
  port: process.env.PORT
})

const startServer = async function(routes) {
  // Enable logging
  await server.register({
    plugin: require('hapi-pino'),
    options: {
        prettyPrint: true,
        logEvents: ['response']
    }
  })

  // Enabled JWT auth
  await server.register(require('hapi-auth-jwt2'))

  server.auth.strategy('auth0_jwk', 'jwt', { 
    complete: true,
    key: jwksRsa.hapiJwt2KeyAsync({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://detecht.auth0.com/.well-known/jwks.json'
    }),
    verifyOptions: {
      audience: 'https://api.detecht.co',
      issuer: 'https://detecht.auth0.com/',
      algorithms: ['RS256']
    },
    validate: validateUser,
  })

  // Set default auth
  server.auth.default('auth0_jwk')

  // Apply routes to server
  server.route(routes)

  // Start server
  try {
    await server.start()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  console.log('Server running at:', server.info.uri)
}

module.exports = {startServer, server}
