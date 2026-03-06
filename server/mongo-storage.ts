import { getMongoDB } from './mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { 
  User, GiftCard, SellRequest, PayoutDetails, KycDocument, Banner, SupportTicket,
  LoginRequest
} from '@shared/schema';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface IMongoStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUserKycStatus(id: number, status: boolean): Promise<User>;
  updateUserKycStatusByEmail(userId: number, status: boolean): Promise<User>;
  
  getGiftCards(): Promise<GiftCard[]>;
  createGiftCard(card: any): Promise<GiftCard>;
  
  getSellRequests(userId?: number): Promise<SellRequest[]>;
  createSellRequest(request: any): Promise<SellRequest>;
  updateSellRequestStatus(id: number, status: string, rejectionNote?: string): Promise<SellRequest>;
  updateSellRequestStatusByMongoId(mongoId: string, status: string, rejectionNote?: string): Promise<SellRequest>;
  
  getPayoutDetails(userId: number): Promise<PayoutDetails | undefined>;
  createPayoutDetails(details: any): Promise<PayoutDetails>;
  
  getKycDocuments(userId?: number): Promise<KycDocument[]>;
  getKycDocumentByUserId(userId: number): Promise<KycDocument | undefined>;
  createKycDocument(doc: any): Promise<KycDocument>;
  updateKycDocumentStatus(id: number, status: string): Promise<KycDocument>;
  updateKycDocumentStatusByMongoId(mongoId: string, status: string): Promise<KycDocument>;
  
  getBanners(): Promise<Banner[]>;
  createBanner(banner: any): Promise<Banner>;
  
  getStats(): Promise<{ totalUsers: number, totalTransactions: number, pendingSellRequests: number, payoutRequests: number }>;
  getAllUsers(): Promise<User[]>;
}

export class MongoStorage implements IMongoStorage {
  private counters: Record<string, number> = {};

  private async getNextSequence(sequenceName: string): Promise<number> {
    const db = await getMongoDB();
    
    try {
      console.log(`Getting next sequence for: ${sequenceName}`);
      console.log('Current counters before:', this.counters);
      
      // Use MongoDB counters collection for persistent sequence numbers
      const result = await db.collection('counters').findOneAndUpdate(
        { name: sequenceName },
        { $inc: { seq: 1 } },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );
      
      console.log('MongoDB sequence result:', result);
      console.log('Current counters after:', this.counters);
      
      if (result && typeof result.seq === 'number') {
        console.log(`Generated sequence: ${result.seq}`);
        return result.seq;
      } else {
        console.log('No sequence result, using fallback');
        // Fallback to in-memory counter if MongoDB fails
        if (!this.counters[sequenceName]) {
          this.counters[sequenceName] = 1;
        } else {
          this.counters[sequenceName]++;
        }
        console.log(`Using fallback sequence: ${this.counters[sequenceName]}`);
        return this.counters[sequenceName];
      }
    } catch (err) {
      console.error('Sequence generation error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      
      // Fallback to in-memory counter if MongoDB fails
      if (!this.counters[sequenceName]) {
        this.counters[sequenceName] = 1;
      } else {
        this.counters[sequenceName]++;
      }
      console.log(`Using fallback sequence: ${this.counters[sequenceName]}`);
      return this.counters[sequenceName];
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const db = await getMongoDB();
    const user = await db.collection('users').findOne({ id });
    return (user as unknown as User) || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getMongoDB();
    const user = await db.collection('users').findOne({ email });
    return (user as unknown as User) || undefined;
  }

  async createUser(insertUser: any): Promise<User> {
    const db = await getMongoDB();
    
    // Use the provided ID from registration route, or generate one if not provided
    const id = insertUser.id || await this.getNextSequence('users');
    
    const user = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isKycVerified: insertUser.isKycVerified || false,
      kycVerified: insertUser.kycVerified || false,
      isActive: true
    };
    
    await db.collection('users').insertOne(user);
    return user;
  }

  async updateUserKycStatus(id: number, status: boolean): Promise<User> {
    const db = await getMongoDB();
    const result = await db.collection('users').findOneAndUpdate(
      { id },
      { 
        $set: { 
          isKycVerified: status, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('User not found');
    }
    
    return result as User;
  }

  async updateUserKycStatusByUserId(userId: number, status: boolean): Promise<User> {
    const db = await getMongoDB();
    console.log("Updating user KYC status by userId:", { userId, status });
    
    // First, let's see all users to debug the duplicate ID issue
    const allUsers = await db.collection('users').find({}).toArray();
    console.log("All users in DB:", allUsers.map(user => ({ 
      _id: user._id, 
      id: user.id, 
      email: user.email, 
      kycVerified: user.kycVerified,
      isKycVerified: user.isKycVerified
    })));
    
    // Find the user that has a KYC document with this userId
    // This is the key: find user by matching the userId from KYC document
    const user = await db.collection('users').findOne({ id: userId });
    console.log("Found user to update:", user);
    
    if (user) {
      const updateResult = await db.collection('users').updateOne(
        { _id: user._id }, // Use MongoDB _id for unique identification
        { 
          $set: { 
            kycVerified: status, // Update old field for backward compatibility
            isKycVerified: status, // Also update new field
            updatedAt: new Date() 
          } 
        }
      );
      console.log("Updated user KYC status:", updateResult);
      return { ...user, kycVerified: status, isKycVerified: status } as unknown as User;
    }
    
    console.warn("Could not find user to update KYC status");
    return null as any;
  }

  async getGiftCards(): Promise<GiftCard[]> {
    const db = await getMongoDB();
    const cards = await db.collection('giftcards').find({}).toArray();
    // Map MongoDB _id to frontend id
    return cards.map(card => ({
      ...card,
      id: card._id || card.id
    })) as unknown as GiftCard[];
  }

  async getAllGiftCards(): Promise<GiftCard[]> {
    const db = await getMongoDB();
    const cards = await db.collection('giftcards').find({}).toArray();
    // Map MongoDB _id to frontend id
    return cards.map(card => ({
      ...card,
      id: card._id || card.id
    })) as unknown as GiftCard[];
  }

  async createGiftCard(insertCard: any): Promise<GiftCard> {
    const db = await getMongoDB();
    const id = await this.getNextSequence('giftcards');
    
    const card = {
      ...insertCard,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('giftcards').insertOne(card);
    return card;
  }

  async updateGiftCard(id: string, updateData: any): Promise<GiftCard | null> {
    const db = await getMongoDB();
    
    // Try to find by MongoDB _id first, then by numeric id
    let query = {};
    
    // Check if id is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      // Try as numeric id
      query = { id: Number(id) };
    }
    
    console.log("Update query:", query, "ID:", id);
    
    const result = await db.collection('giftcards').updateOne(
      query,
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    console.log("Update result:", result);
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    const updated = await db.collection('giftcards').findOne(query);
    return updated ? {
      ...updated,
      id: updated._id || updated.id
    } as GiftCard : null;
  }

  async deleteGiftCard(id: string): Promise<boolean> {
    const db = await getMongoDB();
    
    // Try to find by MongoDB _id first, then by numeric id
    let query = {};
    
    // Check if id is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      // Try as numeric id
      query = { id: Number(id) };
    }
    
    console.log("Delete query:", query, "ID:", id);
    
    const result = await db.collection('giftcards').deleteOne(query);
    
    console.log("Delete result:", result);
    
    return result.deletedCount > 0;
  }

  // Banner Management Methods
  async getAllBanners(): Promise<any[]> {
    const db = await getMongoDB();
    const banners = await db.collection('banners').find({}).toArray();
    // Map MongoDB _id to frontend id
    return banners.map(banner => ({
      ...banner,
      id: banner._id || banner.id
    }));
  }

  async createBanner(insertBanner: any): Promise<any> {
    const db = await getMongoDB();
    const id = await this.getNextSequence('banners');
    
    const banner = {
      ...insertBanner,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('banners').insertOne(banner);
    return banner;
  }

  async updateBanner(id: string, updateData: any): Promise<any | null> {
    const db = await getMongoDB();
    
    // Try to find by MongoDB _id first, then by numeric id
    let query = {};
    
    // Check if id is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      // Try as numeric id
      query = { id: Number(id) };
    }
    
    const result = await db.collection('banners').updateOne(
      query,
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    const updated = await db.collection('banners').findOne(query);
    return updated ? {
      ...updated,
      id: updated._id || updated.id
    } : null;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const db = await getMongoDB();
    
    // Try to find by MongoDB _id first, then by numeric id
    let query = {};
    
    // Check if id is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      // Try as numeric id
      query = { id: Number(id) };
    }
    
    const result = await db.collection('banners').deleteOne(query);
    return result.deletedCount > 0;
  }

  async getSellRequests(userId?: number): Promise<SellRequest[]> {
    const db = await getMongoDB();
    const filter = userId ? { userId } : {};
    const requests = await db.collection('sellrequests').find(filter).toArray() as unknown as SellRequest[];
    
    // Ensure all requests have status field
    return requests.map(req => ({
      ...req,
      status: req.status || 'pending'
    }));
  }

  async createSellRequest(insertRequest: any): Promise<SellRequest> {
    const db = await getMongoDB();
    const id = await this.getNextSequence('sellrequests');
    
    const request = {
      ...insertRequest,
      id,
      status: 'pending', // Add default status
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('sellrequests').insertOne(request);
    return request;
  }

  async updateSellRequestStatus(id: number, status: string, rejectionNote?: string): Promise<SellRequest> {
    const db = await getMongoDB();
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (rejectionNote) {
      updateData.rejectionNote = rejectionNote;
    }
    
    const result = await db.collection('sellrequests').findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Sell request not found');
    }
    
    return result as SellRequest;
  }

  async updateSellRequestStatusByMongoId(mongoId: string, status: string, rejectionNote?: string): Promise<SellRequest> {
    const db = await getMongoDB();
    console.log("Updating sell request by MongoDB _id:", { mongoId, status });
    
    // First verify the document exists
    const existingDoc = await db.collection('sellrequests').findOne({ _id: new ObjectId(mongoId) });
    console.log("Existing document found:", existingDoc);
    
    if (!existingDoc) {
      throw new Error('Sell request not found');
    }
    
    // Update the document
    const result = await db.collection('sellrequests').updateOne(
      { _id: new ObjectId(mongoId) },
      { 
        $set: { 
          status, 
          rejectionNote: rejectionNote || null,
          updatedAt: new Date() 
        } 
      }
    );
    
    console.log("Update result:", { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    
    if (result.matchedCount === 0) {
      throw new Error('Sell request not found');
    }
    
    // Return the updated document
    const updatedDoc = await db.collection('sellrequests').findOne({ _id: new ObjectId(mongoId) });
    return updatedDoc as SellRequest;
  }

  async getPayoutDetails(userId: number): Promise<PayoutDetails | undefined> {
    const db = await getMongoDB();
    const details = await db.collection('payoutdetails').findOne({ userId });
    return (details as unknown as PayoutDetails) || undefined;
  }

  async createPayoutDetails(insertDetails: any): Promise<PayoutDetails> {
    const db = await getMongoDB();
    const id = await this.getNextSequence('payoutdetails');
    
    const details = {
      ...insertDetails,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('payoutdetails').insertOne(details);
    return details;
  }

  async getKycDocuments(userId?: number): Promise<KycDocument[]> {
    const db = await getMongoDB();
    const filter = userId ? { userId } : {};
    const docs = await db.collection('kycdocuments').find(filter).toArray() as unknown as KycDocument[];
    
    // Ensure all documents have status field
    return docs.map(doc => ({
      ...doc,
      status: doc.status || 'pending'
    }));
  }

  async getKycDocumentByUserId(userId: number): Promise<KycDocument | undefined> {
    const db = await getMongoDB();
    const doc = await db.collection('kycdocuments').findOne({ userId });
    
    if (!doc) {
      return undefined;
    }
    
    // Ensure status field exists
    const kycDoc = doc as any;
    if (!kycDoc.status) {
      kycDoc.status = 'pending';
    }
    
    return kycDoc as KycDocument;
  }

  async createKycDocument(insertDoc: any): Promise<KycDocument> {
    const db = await getMongoDB();
    const id = await this.getNextSequence('kycdocuments');
    
    const doc = {
      ...insertDoc,
      id,
      status: 'pending', // Add default status
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('kycdocuments').insertOne(doc);
    return doc;
  }

  async updateKycDocumentStatus(id: number, status: string): Promise<KycDocument> {
    const db = await getMongoDB();
    console.log("Updating KYC document:", { id, status });
    
    const result = await db.collection('kycdocuments').findOneAndUpdate(
      { id },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    console.log("MongoDB update result:", { result });
    
    if (!result) {
      throw new Error('KYC document not found');
    }
    
    return result as KycDocument;
  }

  async updateKycDocumentStatusByMongoId(mongoId: string, status: string): Promise<KycDocument> {
    const db = await getMongoDB();
    console.log("Updating KYC document by MongoDB _id:", { mongoId, status });
    
    // First, let's see what documents exist
    const allDocs = await db.collection('kycdocuments').find({}).toArray();
    console.log("All KYC documents in DB:", allDocs.map(doc => ({ _id: doc._id, id: doc.id, status: doc.status })));
    
    // Try updateOne first
    const updateResult = await db.collection('kycdocuments').updateOne(
      { _id: new ObjectId(mongoId) },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      }
    );
    
    console.log("MongoDB updateOne result:", { updateResult });
    
    if (updateResult.matchedCount === 0) {
      throw new Error('KYC document not found');
    }
    
    // Now fetch the updated document
    const updatedDoc = await db.collection('kycdocuments').findOne({ _id: new ObjectId(mongoId) });
    console.log("Updated document:", updatedDoc);
    
    return updatedDoc as unknown as KycDocument;
  }

  async getBanners(): Promise<Banner[]> {
    const db = await getMongoDB();
    return await db.collection('banners').find({}).toArray() as unknown as Banner[];
  }

  async createBanner(insertBanner: any): Promise<Banner> {
    const db = await getMongoDB();
    const id = await this.getNextSequence('banners');
    
    const banner = {
      ...insertBanner,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('banners').insertOne(banner);
    return banner;
  }

  async getStats(): Promise<{ totalUsers: number, totalTransactions: number, pendingSellRequests: number, payoutRequests: number }> {
    const db = await getMongoDB();
    
    const [usersCount, sellCount, pendingSellCount, payoutRequestsCount] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('sellrequests').countDocuments(),
      db.collection('sellrequests').countDocuments({ status: 'pending' }),
      db.collection('payoutdetails').countDocuments()
    ]);
    
    return {
      totalUsers: usersCount,
      totalTransactions: sellCount,
      pendingSellRequests: pendingSellCount,
      payoutRequests: payoutRequestsCount
    };
  }

  async getAllUsers(): Promise<User[]> {
    const db = await getMongoDB();
    return await db.collection('users').find({}).toArray() as unknown as User[];
  }
}

export const mongoStorage = new MongoStorage();
