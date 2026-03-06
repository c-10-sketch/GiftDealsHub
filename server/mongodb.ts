import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mhasanujjaman978_db_user:ddorfegDD4dN4yVd@giftcard.obahsmu.mongodb.net/?appName=giftcard';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'giftcard';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI must be set');
}

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (client && client.isConnected()) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getMongoDB(): Promise<Db> {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

export async function closeMongoDBConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', closeMongoDBConnection);
process.on('SIGTERM', closeMongoDBConnection);
