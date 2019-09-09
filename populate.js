require('./src/config')
const mongoose = require('mongoose')

populate()

async function populate () {
  // Connect and make a set with all collections
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })
  const collections = await mongoose.connection.db.listCollections().toArray()
  if (collections.length > 0) {
    console.log('\n\nDatabase not empty, aborting.\n\n')
    process.exit()
    return
  }

  
}