import { MongoClient, ServerApiVersion } from 'mongodb'

// const {MongoClient, ServerApiVersion} = require('mongodb')

const MONGODB_DATABASE_PASSWORD = 'PoPTFFdvINiQoiIH'
const mongodb_url = `mongodb://gaorock530:${MONGODB_DATABASE_PASSWORD}@ac-l5ds5kp-shard-00-00.dmo2nz6.mongodb.net:27017,ac-l5ds5kp-shard-00-01.dmo2nz6.mongodb.net:27017,ac-l5ds5kp-shard-00-02.dmo2nz6.mongodb.net:27017/?ssl=true&replicaSet=atlas-5h48w7-shard-0&authSource=admin&retryWrites=true&w=majority` 

export default new MongoClient(mongodb_url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

