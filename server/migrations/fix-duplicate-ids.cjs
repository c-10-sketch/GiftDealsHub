require('dotenv').config();
const { MongoClient } = require('mongodb');

/*
 Fix duplicate numeric IDs in users collection
 Ensures every user has a unique sequential id
*/

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "giftcard";

if (!uri) {
  console.error("❌ MONGODB_URI missing in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

async function fixDuplicateIds() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).sort({ id: 1 }).toArray();

    if (users.length === 0) {
      console.log("No users found.");
      return;
    }

    console.log(`🔍 Found ${users.length} users`);

    let nextId = 1;
    const usedIds = new Set();

    for (const user of users) {
      let newId = user.id;

      // if duplicate OR missing id
      if (!newId || usedIds.has(newId)) {
        while (usedIds.has(nextId)) {
          nextId++;
        }
        newId = nextId;
      }

      usedIds.add(newId);

      if (user.id !== newId) {
        console.log(`Updating ${user._id} → id ${user.id} → ${newId}`);

        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              id: newId,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    console.log("🎉 Duplicate ID fix completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

fixDuplicateIds();