import type { Express } from "express";
import type { Server } from "http";
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { mongoStorage } from "./mongo-storage";
import { api } from "@shared/routes";
import { getNextSequence } from "./utils/counter";
import { getMongoDB } from "./mongodb";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { requireAuth, requireAdmin, type AuthRequest } from './auth';

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: 'de8fd2equ', 
  api_key: '161283949245255', 
  api_secret: '-2UDdwxZjMjG4HTUKfaF7IjNabQ' 
});

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'kyc_docs',
      allowed_formats: ['jpg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      access_mode: 'authenticated', 
    };
  },
});

const upload = multer({ 
  storage: cloudStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-prod";

async function seedDatabase(storage: any) {
  const usersList = await storage.getAllUsers();
  if (usersList.length === 0) {
    
  }

  const existingCards = await storage.getGiftCards();
  if (existingCards.length === 0) {
    await storage.createGiftCard({
      title: "Amazon Gift Card",
      description: "Buy any product on Amazon",
      price: "100.00",
      discount: "5",
      imageUrl: "https://images.unsplash.com/photo-1620241608701-94ef138fc3eb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      isActive: true,
    });
    await storage.createGiftCard({
      title: "Steam Wallet Code",
      description: "Add funds to your Steam Wallet",
      price: "50.00",
      discount: "2",
      imageUrl: "https://images.unsplash.com/photo-1629856149174-8db99321c1f7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      isActive: true,
    });
  }

  const existingBanners = await storage.getBanners();
  if (existingBanners.length === 0) {
    await storage.createBanner({
      title: "Welcome to GiftCard Exchange!",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      type: "announcement",
      isActive: true,
    });
  }
}

export async function registerRoutes(
  _httpServer: Server | undefined,
  app: Express
): Promise<void> {
  

  const storage = mongoStorage;
  
  app.post(api.auth.register.path, async (req, res) => {
    try {
      console.log("Registration request:", req.body);
      const input = api.auth.register.input.parse(req.body);
      console.log("Parsed input:", input);
      
      const existingUser = await storage.getUserByEmail(input.email);
      console.log("Existing user:", existingUser);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

    
      const isSuperAdmin = input.email === "mhasanujjaman978@gmail.com";
      const role = isSuperAdmin ? "SUPER_ADMIN" : "USER";
      
      
      const db = await getMongoDB();
      let nextId: number | undefined;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        const userCount = await db.collection('users').countDocuments();
        nextId = userCount + 1;
        
        console.log(`🔍 Attempt ${retries + 1}: userCount=${userCount}, nextId=${nextId}`);
        
        // Check if this ID already exists (race condition protection)
        const existingWithId = await db.collection('users').findOne({ id: nextId });
        
        console.log(`🔍 Check ID ${nextId}: exists=${!!existingWithId}`);
        
        if (!existingWithId) {
          console.log(`✅ Found unique ID: ${nextId}`);
          break; // Found a unique ID
        }
        
        retries++;
        console.log(`⚠️  ID ${nextId} already exists, retrying... (${retries}/${maxRetries})`);
      }
      
      console.log("User role:", { email: input.email, role, nextId, userCount: await db.collection('users').countDocuments() });
      
      // Safety fallback: if we still can't get unique ID, mark as KYC verified
      let kycVerified = false;
      if (retries >= maxRetries || nextId === undefined) {
        console.log("⚠️  Could not generate unique ID, marking user as KYC verified as fallback");
        kycVerified = true;
        // As last resort, use a random high number
        nextId = Date.now() % 10000 + 1000;
        console.log(`🚨 Using fallback ID: ${nextId}`);
      }

      const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : null;
      
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        role,
        id: nextId,
        kycVerified: kycVerified,
        isKycVerified: kycVerified,
      });
      console.log("User created:", user);

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      console.log("Token generated:", !!token);
      
      res.status(201).json({ token, user });
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.auth.me.path, requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json(user);
  });

  // -- Gift Cards --
  app.get(api.giftCards.list.path, async (req, res) => {
    const cards = await storage.getGiftCards();
    // Map _id to id for frontend compatibility
    const mappedCards = cards.map(card => {
      const mongoCard = card as { _id?: string | number };
      return {
        ...card,
        id: mongoCard._id || card.id,
      };
    });
    res.status(200).json(mappedCards);
  });

  // -- Admin Banner Management
  app.get("/api/admin/banners", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.status(200).json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const input = {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        link: req.body.link || null,
        type: req.body.type || "banner",
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const result = await storage.createBanner(input);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating banner:", error);
      res.status(400).json({ message: "Failed to create banner" });
    }
  });

  app.put("/api/admin/banners/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const input = {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        link: req.body.link || null,
        type: req.body.type || "banner",
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      // Handle both MongoDB _id and numeric id
      const result = await storage.updateBanner(String(id), input);
      if (!result) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(400).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteBanner(String(id));
      if (!result) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(400).json({ message: "Failed to delete banner" });
    }
  });

  // -- Admin Gift Card Management

  app.get("/api/admin/gift-cards", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const cards = await storage.getAllGiftCards();
      res.status(200).json(cards);
    } catch (error) {
      console.error("Error fetching admin gift cards:", error);
      res.status(500).json({ message: "Failed to fetch gift cards" });
    }
  });

  app.post("/api/admin/gift-cards", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const input = {
        name: req.body.name,
        description: req.body.description,
        discount: Number(req.body.discount),
        price: Number(req.body.price),
        imageUrl: req.body.imageUrl || null,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const result = await storage.createGiftCard(input);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating gift card:", error);
      res.status(400).json({ message: "Failed to create gift card" });
    }
  });

  app.put("/api/admin/gift-cards/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const input = {
        name: req.body.name,
        description: req.body.description,
        discount: Number(req.body.discount),
        price: Number(req.body.price),
        imageUrl: req.body.imageUrl || null,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      // Handle both MongoDB _id and numeric id
      const result = await storage.updateGiftCard(String(id), input);
      if (!result) {
        return res.status(404).json({ message: "Gift card not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating gift card:", error);
      res.status(400).json({ message: "Failed to update gift card" });
    }
  });

  app.delete("/api/admin/gift-cards/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteGiftCard(String(id));
      if (!result) {
        return res.status(404).json({ message: "Gift card not found" });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting gift card:", error);
      res.status(400).json({ message: "Failed to delete gift card" });
    }
  });

  // -- Sell Requests --
  app.get(api.sellRequests.list.path, requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    // Admin sees all, User sees theirs
    const requests = req.user.role === 'SUPER_ADMIN' 
      ? await storage.getSellRequests()
      : await storage.getSellRequests(req.user.id);
    res.status(200).json(requests);
  });

  app.post(api.sellRequests.create.path, requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(401).json({ message: "User not found" });
      
      // Check if user has verified KYC document
      const kycDocument = await storage.getKycDocumentByUserId(user.id);
      const isKycVerified = kycDocument && kycDocument.status === 'verified';
      
      console.log("KYC check:", { 
        userId: user.id, 
        kycStatus: kycDocument?.status, 
        isKycVerified 
      });

      if (user.role !== "SUPER_ADMIN" && !isKycVerified) {
        return res.status(403).json({ message: "Complete KYC to sell gift cards." });
      }

      // Convert inputs to numbers
      const bodySchema = api.sellRequests.create.input.extend({
        balance: z.coerce.string(), // numeric in DB is stored as string/decimal
      });
      
      const input = bodySchema.parse(req.body);
      const request = await storage.createSellRequest({
        ...input,
        userId: req.user.id,
      });
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.sellRequests.updateStatus.path, requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionNote } = req.body;
      console.log("Sell request update:", { id, status, rejectionNote });
      
      // Use MongoDB _id directly (no numeric conversion needed)
      const updated = await storage.updateSellRequestStatusByMongoId(String(id), status, rejectionNote);
      console.log("Updated sell request:", updated);
      res.status(200).json(updated);
    } catch (err) {
      console.error("Sell request update error:", err);
      res.status(404).json({ message: "Not found" });
    }
  });

  // -- Payout Details --
  app.get(api.payoutDetails.get.path, requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const details = await storage.getPayoutDetails(req.user.id);
    res.status(200).json(details || null);
  });

  app.post(api.payoutDetails.save.path, requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.payoutDetails.save.input.parse(req.body);
      const details = await storage.createPayoutDetails({
        ...input,
        userId: req.user.id,
      });
      res.status(200).json(details);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // -- KYC --
  app.get(api.kyc.get.path, requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const doc = await storage.getKycDocumentByUserId(req.user.id);
    res.status(200).json(doc || null);
  });

  app.post(api.kyc.submit.path, requireAuth, upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
  ]), async (req: AuthRequest & { files?: any }, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const existingKyc = await storage.getKycDocumentByUserId(req.user.id);
      if (existingKyc) {
        if (existingKyc.status === 'Verified') {
          return res.status(400).json({ message: "KYC already verified" });
        }
        if (existingKyc.status === 'Rejected') {
          const rejectedAt = existingKyc.createdAt ? new Date(existingKyc.createdAt).getTime() : 0;
          const now = new Date().getTime();
          const hoursSinceRejection = (now - rejectedAt) / (1000 * 60 * 60);
          if (hoursSinceRejection < 24) {
            return res.status(400).json({ message: "You can re-apply 24 hours after rejection." });
          }
        }
      }

      const files = req.files as { [fieldname: string]: any[] };
      if (!files?.idProof?.[0] || !files?.selfie?.[0] || !files?.addressProof?.[0]) {
        return res.status(400).json({ message: "All documents are required" });
      }

      const doc = await storage.createKycDocument({
        userId: req.user.id,
        idProofUrl: files.idProof[0].path,
        selfieUrl: files.selfie[0].path,
        addressProofUrl: files.addressProof[0].path,
      });
      res.status(201).json(doc);
    } catch (err) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.get(api.kyc.list.path, requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const docs = await storage.getKycDocuments();
    const optimizedDocs = docs.map(doc => ({
      ...doc,
      idProofUrl: cloudinary.url(doc.idProofUrl, { sign_url: true, width: 800, quality: 'auto', fetch_format: 'auto' }),
      selfieUrl: cloudinary.url(doc.selfieUrl, { sign_url: true, width: 800, quality: 'auto', fetch_format: 'auto' }),
      addressProofUrl: cloudinary.url(doc.addressProofUrl, { sign_url: true, width: 800, quality: 'auto', fetch_format: 'auto' }),
    }));
    res.status(200).json(optimizedDocs);
  });

  app.patch(api.kyc.updateStatus.path, requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const numericId = Number(id);
      console.log("KYC update request:", { id, numericId, status });
      
      const normalizedStatus = status.toLowerCase(); // Normalize to lowercase
      
      // First try to find by numeric ID, if not found, try by MongoDB _id
      let updated;
      try {
        console.log("Trying to update by numeric ID:", numericId);
        updated = await storage.updateKycDocumentStatus(numericId, normalizedStatus);
        console.log("Updated by numeric ID:", updated);
      } catch (err) {
        console.log("Failed to update by numeric ID, trying MongoDB _id...");
        updated = await storage.updateKycDocumentStatusByMongoId(String(id), normalizedStatus);
        console.log("Updated by MongoDB _id:", updated);
      }
      
      console.log("Final updated KYC document:", updated);
      
      if (normalizedStatus === 'verified') {
        console.log("Updating user KYC status to true for userId:", updated.userId);
        await storage.updateUserKycStatusByUserId(updated.userId, true);
      } else if (normalizedStatus === 'rejected') {
        console.log("Updating user KYC status to false for userId:", updated.userId);
        await storage.updateUserKycStatusByUserId(updated.userId, false);
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error("KYC update error:", err);
      res.status(404).json({ message: "Not found" });
    }
  });

  // -- Banners --
  app.get(api.banners.list.path, async (req, res) => {
    const b = await storage.getBanners();
    res.status(200).json(b);
  });

  app.post(api.banners.create.path, requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const input = api.banners.create.input.parse(req.body);
      const b = await storage.createBanner(input);
      res.status(201).json(b);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // -- Admin Stats --
  app.get(api.admin.dashboardStats.path, requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const stats = await storage.getStats();
    res.status(200).json(stats);
  });

  app.get(api.admin.users.path, requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const users = await storage.getAllUsers();
    res.status(200).json(users);
  });

  app.get("/api/admin/payout-details/:userId", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const { userId } = req.params;
    const details = await storage.getPayoutDetails(Number(userId));
    res.status(200).json(details || null);
  });

  // Call Seed Function
  seedDatabase(storage).catch(err => {
    console.log("Database seeding error:", err.message);
    console.error(err);
  });

}
