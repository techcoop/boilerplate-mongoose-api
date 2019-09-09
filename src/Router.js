'use strict'

// TODO improve test coverage
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

  hydrateQuery(query, params) {
    const hydrated = Object.assign({}, query)
    const fields = this.Model.schema.paths

    if (!params) {
      return hydrated
    }

    Object.keys(params).forEach((param) => {
      if (fields[param]) {
        hydrated[param] = params[param]
      }
    })
    
    return hydrated
  }

  filterQuery(query) {
    if (!query) {
      return query
    }

    const newQuery = {}
    Object.keys(query).forEach((field) => {
      if (query[field].startsWith('*') || query[field].endsWith('*')) {
        // TODO handle multiple matches seperated with ,
        newQuery[field] = { '$regex' : query[field].replace(new RegExp('\\*', 'g'), '.*'), '$options' : 'i' }
      } else {
        newQuery[field] = query[field].split(',')
      }
    })
    
    return newQuery
  }

  async getListHandler(request, h) {
    const { 
      limit,
      page,
      sortDir,
      sortField,
      populate,
      pagination,
      ...rest } = request.query

    const query = this.hydrateQuery(this.filterQuery(rest), request.params)
    
    if (pagination) {
      // TODO add handling for other options? populate, lean, etc?
      // https://github.com/WebGangster/mongoose-paginate-v2
      let results
      let options = {limit, page}
      if (!sortField && !sortDir) {
        options.sort = { createdAt: -1 }
      } else {
        options.sort = { [sortField]: sortDir }
      }

      if (populate) {
        //options.populate = populate.split(',')
        options.populate = populate.split(',').map((item) => (
          this.getPopulate(item.split('.'))
        ))
      }
      
      results = await this.Model.paginate(query, options)
      
      return h.response({results: results.docs, totalCount: results.totalDocs});
    } else {
      if (populate) {
        const populateOptions = populate.split(',').map((item) => (
          this.getPopulate(item.split('.'))
        ))

        return await this.Model.find(query).populate(populateOptions)
      } else {
        return await this.Model.find(query)
      }
    }
  }

  getPopulate(parts) {
    if (parts.length === 1) {
      return { path: parts[0] }
    } else {
      return { 
        path: parts[0],
        populate: this.getPopulate(parts.slice(1))
      }
    }
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
    return this.Model.findByIdAndUpdate(request.params.id, request.payload, {new: true})
  }

  async deleteHandler(request, h) {
    await this.Model.findByIdAndDelete(request.params.id)
    return h.response().code(204)
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
