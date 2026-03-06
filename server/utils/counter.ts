import { Db, MongoClient } from "mongodb";

/**
 * Auto-increment counter for MongoDB collections
 * Ensures unique sequential IDs for users, sell requests, KYC documents, etc.
 */
export async function getNextSequence(db: Db, name: string): Promise<number> {
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  if (!result.value) {
    throw new Error(`Failed to generate sequence for ${name}`);
  }

  return result.value.seq;
}

/**
 * Get MongoDB database instance from storage
 */
export async function getDatabaseFromStorage(storage: any): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGODB_DB_NAME || "giftcard");
}
