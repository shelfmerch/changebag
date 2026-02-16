
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "MONGODB_URI=mongodb+srv://shabahatsyed101:8flCr5MKAfy15JpW@cluster0.w8cgqlr.mongodb.net/causebag";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("causebags");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export function getClient() {
  return client;
}
