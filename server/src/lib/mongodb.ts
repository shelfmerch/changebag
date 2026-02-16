import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Ensure MONGODB_URI is defined and is a string
const MONGODB_URI = process.env.MONGODB_URI as string;
console.log('MongoDB URI:', MONGODB_URI ? 'URI is defined' : 'URI is missing');

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection...');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Successfully connected to MongoDB');
        // Log the available collections
        if (mongoose.connection.db) {
          mongoose.connection.db.listCollections().toArray()
            .then((collections: any[]) => {
              console.log('Available collections:', collections.map((c: any) => c.name));
            })
            .catch((error: Error) => {
              console.error('Error listing collections:', error);
            });
        }
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
