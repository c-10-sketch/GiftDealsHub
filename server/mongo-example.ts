import { getMongoDB } from './mongodb.js';

// Example usage of MongoDB in your application
export async function createGiftCard(data: {
  code: string;
  amount: number;
  recipient: string;
  message?: string;
}) {
  const db = await getMongoDB();
  const collection = db.collection('giftcards');
  
  const giftCard = {
    ...data,
    createdAt: new Date(),
    status: 'active',
    used: false
  };
  
  const result = await collection.insertOne(giftCard);
  return { ...giftCard, _id: result.insertedId };
}

export async function getGiftCard(code: string) {
  const db = await getMongoDB();
  const collection = db.collection('giftcards');
  
  return await collection.findOne({ code });
}

export async function useGiftCard(code: string) {
  const db = await getMongoDB();
  const collection = db.collection('giftcards');
  
  return await collection.updateOne(
    { code, used: false },
    { 
      $set: { used: true, usedAt: new Date() },
      $currentDate: { lastModified: true }
    }
  );
}
