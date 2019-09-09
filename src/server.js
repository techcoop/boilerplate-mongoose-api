'use strict'

const hapi = require('@hapi/hapi')
const jwksRsa = require('jwks-rsa')
const validateUser = require('./middlewares/users').validateUser

const paginationOptions = {
  query: {
    page: {name: 'page', default: 1},
    limit: {name: 'limit', default: 5}
  },
  meta: {
    location: 'header'
  },
  routes: {
    include: [
      '*',
      // Instead of * you can enable pagination by route pattern
      //'/users',
      //'/products',
      //'/users/{_user}/products'
    ],
    exclude: []
  }
}

const createServer = () => {
  return hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : undefined,
        additionalExposedHeaders: ['Content-Range', 'Link'],
        additionalHeaders: ['Content-Range', 'Link']
      }
    }
  })
}

const startServer = async function(routes = [], server = createServer(), startServer = true) {
  // Enable logging
  await server.register({
    plugin: require('hapi-pino'),
    options: {
      prettyPrint: true,
      logEvents: ['response']
    }
  })

  // Enable pagination
  await server.register({plugin: require('hapi-pagination'), options: paginationOptions})

  // Enabled JWT auth
  await server.register(require('hapi-auth-jwt2'))

  server.auth.strategy('auth0_jwk', 'jwt', { 
    complete: true,
    key: jwksRsa.hapiJwt2KeyAsync({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.AUTH0_JWKS
    }),
    verifyOptions: {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_ISSUER,
      algorithms: ['RS256']
    },
    validate: validateUser,
  })

  // Set default auth
  server.auth.default('auth0_jwk')

  // Apply routes to server
  server.route(routes)

  if (startServer) {
    // Start server
    try {
      await server.start()
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(err)
      }
    }
  }
  return server
}

module.exports = { createServer, startServer }
