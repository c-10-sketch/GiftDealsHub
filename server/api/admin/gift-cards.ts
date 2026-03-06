import { z } from "zod";
import { MongoStorage } from "@/lib/mongo-storage";
import { authenticatedProcedure, router } from "../trpc";

const giftCardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
  price: z.number().min(0, "Price must be positive"),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const giftCardsRouter = router({
  // Get all gift cards (for admin)
  list: authenticatedProcedure
    .meta({ adminOnly: true })
    .output(z.array(giftCardSchema.extend({
      id: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })))
    .query(async () => {
      const storage = MongoStorage.getInstance();
      const giftCards = await storage.db.collection("giftcards").find({}).toArray();
      return giftCards.map(card => ({
        ...card,
        id: card._id,
        createdAt: card.createdAt || new Date().toISOString(),
        updatedAt: card.updatedAt || new Date().toISOString(),
      }));
    }),

  // Create new gift card
  create: authenticatedProcedure
    .meta({ adminOnly: true })
    .input(giftCardSchema)
    .output(giftCardSchema.extend({
      id: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }))
    .mutation(async ({ input }) => {
      const storage = MongoStorage.getInstance();
      const result = await storage.db.collection("giftcards").insertOne({
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return {
        ...input,
        id: result.insertedId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),

  // Update gift card
  update: authenticatedProcedure
    .meta({ adminOnly: true })
    .input(giftCardSchema.extend({
      id: z.number(),
    }))
    .output(giftCardSchema.extend({
      id: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }))
    .mutation(async ({ input }) => {
      const storage = MongoStorage.getInstance();
      const { id, ...updateData } = input;
      
      await storage.db.collection("giftcards").updateOne(
        { _id: id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date().toISOString(),
          }
        }
      );
      
      const updated = await storage.db.collection("giftcards").findOne({ _id: id });
      return {
        ...updated,
        id: updated._id,
        createdAt: updated.createdAt || new Date().toISOString(),
        updatedAt: updated.updatedAt || new Date().toISOString(),
      };
    }),

  // Delete gift card
  delete: authenticatedProcedure
    .meta({ adminOnly: true })
    .input(z.object({ id: z.number() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      const storage = MongoStorage.getInstance();
      await storage.db.collection("giftcards").deleteOne({ _id: input.id });
      return { success: true };
    }),
});
