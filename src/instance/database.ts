import { MongoClient, ServerApiVersion } from 'mongodb';
import { DB_DATABASE } from '@config';

export default new MongoClient(DB_DATABASE, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
