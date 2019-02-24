function list({ _page = 1, _limit = 20, _sort = '-createdAt', ...rest } = {}) {
  const promise = this.find().limit(_limit)

  // TODO calc skip and sort and handle rest filtering?

  return promise
}

module.exports = { list }