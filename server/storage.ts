import { db } from "./db";
import {
  users, giftCards, sellRequests, payoutDetails, kycDocuments, banners, supportTickets,
  type User, type GiftCard, type SellRequest, type PayoutDetails, type KycDocument, type Banner, type SupportTicket,
  type LoginRequest
} from "../shared/schema";
import { eq } from "drizzle-orm";
import { type InferInsertModel } from "drizzle-orm";

type InsertUser = InferInsertModel<typeof users>;
type InsertGiftCard = InferInsertModel<typeof giftCards>;
type InsertSellRequest = InferInsertModel<typeof sellRequests>;
type InsertPayoutDetails = InferInsertModel<typeof payoutDetails>;
type InsertKycDocument = InferInsertModel<typeof kycDocuments>;
type InsertBanner = InferInsertModel<typeof banners>;
type InsertSupportTicket = InferInsertModel<typeof supportTickets>;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserKycStatus(id: number, status: boolean): Promise<User>;
  
  getGiftCards(): Promise<GiftCard[]>;
  createGiftCard(card: InsertGiftCard): Promise<GiftCard>;
  
  getSellRequests(userId?: number): Promise<SellRequest[]>;
  createSellRequest(request: InsertSellRequest): Promise<SellRequest>;
  updateSellRequestStatus(id: number, status: string, rejectionNote?: string): Promise<SellRequest>;
  
  getPayoutDetails(userId: number): Promise<PayoutDetails | undefined>;
  createPayoutDetails(details: InsertPayoutDetails): Promise<PayoutDetails>;
  
  getKycDocuments(userId?: number): Promise<KycDocument[]>;
  getKycDocumentByUserId(userId: number): Promise<KycDocument | undefined>;
  createKycDocument(doc: InsertKycDocument): Promise<KycDocument>;
  updateKycDocumentStatus(id: number, status: string): Promise<KycDocument>;
  
  getBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  
  getStats(): Promise<{ totalUsers: number, totalTransactions: number, pendingSellRequests: number, payoutRequests: number }>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("PostgreSQL not available");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserKycStatus(id: number, status: boolean): Promise<User> {
    const [user] = await db.update(users).set({ isKycVerified: status }).where(eq(users.id, id)).returning();
    return user;
  }

  async getGiftCards(): Promise<GiftCard[]> {
    return await db.select().from(giftCards).where(eq(giftCards.isActive, true));
  }

  async createGiftCard(card: InsertGiftCard): Promise<GiftCard> {
    const [newCard] = await db.insert(giftCards).values(card).returning();
    return newCard;
  }

  async getSellRequests(userId?: number): Promise<SellRequest[]> {
    if (userId) {
      return await db.select().from(sellRequests).where(eq(sellRequests.userId, userId));
    }
    return await db.select().from(sellRequests);
  }

  async createSellRequest(request: InsertSellRequest): Promise<SellRequest> {
    const [newRequest] = await db.insert(sellRequests).values(request).returning();
    return newRequest;
  }

  async updateSellRequestStatus(id: number, status: string, rejectionNote?: string): Promise<SellRequest> {
    const [updated] = await db.update(sellRequests).set({ status, rejectionNote }).where(eq(sellRequests.id, id)).returning();
    return updated;
  }

  async getPayoutDetails(userId: number): Promise<PayoutDetails | undefined> {
    const [details] = await db.select().from(payoutDetails).where(eq(payoutDetails.userId, userId));
    return details;
  }

  async createPayoutDetails(details: InsertPayoutDetails): Promise<PayoutDetails> {
    const [newDetails] = await db.insert(payoutDetails).values(details).onConflictDoUpdate({
      target: payoutDetails.userId,
      set: details,
    }).returning();
    return newDetails;
  }

  async getKycDocuments(userId?: number): Promise<KycDocument[]> {
    if (userId) {
      return await db.select().from(kycDocuments).where(eq(kycDocuments.userId, userId));
    }
    return await db.select().from(kycDocuments);
  }

  async getKycDocumentByUserId(userId: number): Promise<KycDocument | undefined> {
    const [doc] = await db.select().from(kycDocuments).where(eq(kycDocuments.userId, userId));
    return doc;
  }

  async createKycDocument(doc: InsertKycDocument): Promise<KycDocument> {
    const [newDoc] = await db.insert(kycDocuments).values(doc).onConflictDoUpdate({
      target: kycDocuments.userId,
      set: doc,
    }).returning();
    return newDoc;
  }

  async updateKycDocumentStatus(id: number, status: string): Promise<KycDocument> {
    const [updated] = await db.update(kycDocuments).set({ status }).where(eq(kycDocuments.id, id)).returning();
    return updated;
  }

  async getBanners(): Promise<Banner[]> {
    return await db.select().from(banners).where(eq(banners.isActive, true));
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [newBanner] = await db.insert(banners).values(banner).returning();
    return newBanner;
  }

  async getStats(): Promise<{ totalUsers: number, totalTransactions: number, pendingSellRequests: number, payoutRequests: number }> {
    const usersCount = (await db.select().from(users)).length;
    const sellCount = (await db.select().from(sellRequests)).length;
    const pendingSellCount = (await db.select().from(sellRequests).where(eq(sellRequests.status, "Pending"))).length;
    const payoutRequestsCount = (await db.select().from(payoutDetails)).length;
    
    return {
      totalUsers: usersCount,
      totalTransactions: sellCount,
      pendingSellRequests: pendingSellCount,
      payoutRequests: payoutRequestsCount
    };
  }

  async getAllUsers(): Promise<User[]> {
    if (!db) throw new Error("PostgreSQL not available");
    return await db.select().from(users);
  }
}

export const storage = new DatabaseStorage();
