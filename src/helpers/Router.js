'use strict'

class Router {
  constructor(Model, path, types = ['get', 'getOne', 'post', 'put', 'patch', 'delete']) {
    this.Model = Model
    this.path = path
    this._routes = {}

    this._types = {
      get: {
        method: 'GET',
        path: this.path,
        config: {
          handler: this.getListHandler.bind(this)
        }
      },
      getOne: {
        method: 'GET',
        path: `${this.path}/{id}`,
        config: {
          handler: this.getOneHandler.bind(this)
        }
      },
      post: {
        method: 'POST',
        path: `${this.path}`,
        config: {
          handler: this.postHandler.bind(this)
        }
      },
      put: {
        method: 'PUT',
        path: `${this.path}/{id}`,
        config: {
          handler: this.putHandler.bind(this)
        }
      },
      patch: {
        method: 'PATCH',
        path: `${this.path}/{id}`,
        config: {
          handler: this.patchHandler.bind(this)
        }
      },
      delete: {
        method: 'DELETE',
        path: `${this.path}/{id}`,
        config: {
          handler: this.deleteHandler.bind(this)
        }
      }
    }

    if (types) {
      types.forEach((type) => {
        if (this._types[type]) {
          this.route(type, this._types[type])
        }
      })
    }
  }

  hydratePayload(payload, params) {
    const hydrated = Object.assign({}, payload)
    const fields = this.Model.schema.paths
    Object.keys(params).forEach((param) => {
      if (fields[param]) {
        hydrated[param] = params[param]
      }
    })

    return hydrated
  }

  async getListHandler(request, h) {
    return this.Model.list(request.query).exec()
  }

  async getOneHandler(request, h) {
    return this.Model.findById(request.params.id).exec()
  }

  async postHandler(request, h) {
    const item = await new this.Model(this.hydratePayload(request.payload, request.params)).save()
    return h.response(item).code(201)
  }

  async putHandler(request, h) {
    // TODO look into using find and replace here instead?
    // TODO hydrate with user params
    // TODO enforce ACL / auth
    //console.log(this.hydratePayload(request.payload, request.params))
    return this.Model.findByIdAndUpdate(request.params.id, request.payload, {new: true})
  }

  async patchHandler(request, h) {
    // TODO enforce ACL / auth
    return this.Model.findByIdAndUpdate(request.params.id, request.payload, {new: true})
  }

  async deleteHandler(request, h) {
    // TODO enforce ACL / auth
    await this.Model.findByIdAndDelete(request.params.id)
    return h.response().code(204)
  }
  
  makePublic(types) {
    types.forEach((type) => {
      this.makeRoutePublic(type)
    })
  }

  makePrivate(types) {
    types.forEach((type) => {
      this.makeRoutePrivate(type)
    })
  }

  makeScoped(types, scope) {
    types.forEach((type) => {
      this.makeRouteScoped(type, scope)
    })
  }
  
  makeRoutePublic(type) {
    if (this._routes[type]) {
      this._routes[type].config.auth = false
    }
  }

  makeRoutePrivate(type) {
    if (this._routes[type]) {
      this._routes[type].config.auth = 'auth0_jwk'
    }
  }

  makeRouteScoped(type, scope) {
    if (this._routes[type]) {
      this._routes[type].config.auth = {strategy: 'auth0_jwk', scope }
    }
  }

  route(type, route) {
    if (type && route) {
      this._routes[type] = route
      return
    }

    if (type && !route && this._types[type]) {
      this._routes[type] = this._types[type]
      return
    }

    throw new Error(`Error adding route to "${this.path}" module`)
  }

  routes() {
    return Object.values(this._routes)
  }
}

module.exports = Router
