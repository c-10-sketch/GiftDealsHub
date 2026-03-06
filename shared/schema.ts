import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  password: text("password"),
  role: text("role").notNull().default("USER"),
  isKycVerified: boolean("is_kyc_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  discount: numeric("discount").notNull().default("0"),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true),
});

export const sellRequests = pgTable("sell_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  brandName: text("brand_name").notNull(),
  cardNumber: text("card_number").notNull(),
  cardPin: text("card_pin").notNull(),
  balance: numeric("balance").notNull(),
  expiryDate: text("expiry_date").notNull(),
  status: text("status").notNull().default("Pending"),
  rejectionNote: text("rejection_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payoutDetails = pgTable("payout_details", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  accountHolderName: text("account_holder_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
});

export const kycDocuments = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  idProofUrl: text("id_proof_url").notNull(),
  selfieUrl: text("selfie_url").notNull(),
  addressProofUrl: text("address_proof_url").notNull(),
  status: text("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  type: text("type").notNull(),
  link: text("link"),
  isActive: boolean("is_active").default(true),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("Open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, role: true, isKycVerified: true });
export const insertGiftCardSchema = createInsertSchema(giftCards).omit({ id: true });
export const insertSellRequestSchema = createInsertSchema(sellRequests).omit({ id: true, userId: true, status: true, rejectionNote: true, createdAt: true });
export const insertPayoutDetailsSchema = createInsertSchema(payoutDetails).omit({ id: true, userId: true });
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true, userId: true, status: true, createdAt: true });
export const insertBannerSchema = createInsertSchema(banners).omit({ id: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, userId: true, status: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type GiftCard = typeof giftCards.$inferSelect;
export type SellRequest = typeof sellRequests.$inferSelect;
export type PayoutDetails = typeof payoutDetails.$inferSelect;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof loginSchema>;
