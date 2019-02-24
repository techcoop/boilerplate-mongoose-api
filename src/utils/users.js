const User = require('../modules/users').User

const validateUser = async (decoded, request, h) => {
  if (!decoded || !decoded.sub) {
    return { isValid: false }
  }
  
  decoded.scope = decoded.scope.split(' ')

  // Get user id from local database with sub, or create
  let user = await User.findOne({ 'subs': decoded.sub }).exec()
  if (!user) {
    user = await new User({ subs: decoded.sub }).save()
  }
  
  // If we have a _user parameter in request, ensure that this user is the owner
  if (request.params && request.params._user && request.params._user !== user._id.toString()) {
    const response = h.response({ statusCode: 401, message: 'Invalid ownership of resource' }).code(401)
    return { isValid: false, response: response }
  }

  decoded._id = user._id

  return { isValid: true, credentials: decoded }
}

module.exports = { validateUser }
