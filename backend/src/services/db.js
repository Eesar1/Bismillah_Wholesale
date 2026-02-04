import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "bismillah_wholesale";

let cachedClient = null;
let cachedDb = null;

export const isMongoEnabled = () => Boolean(uri);

export const getMongoDb = async () => {
  if (!uri) {
    return null;
  }

  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
};
