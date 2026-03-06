import { z } from "zod";
import { MongoStorage } from "@/lib/mongo-storage";
import { publicProcedure, router } from "../trpc";

const giftCardSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  discount: z.number(),
  price: z.number(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const giftCardsRouter = router({
  // Get all active gift cards (for public Buy page)
  list: publicProcedure
    .output(z.array(giftCardSchema))
    .query(async () => {
      const storage = MongoStorage.getInstance();
      const giftCards = await storage.db.collection("giftcards").find({ 
        isActive: true 
      }).toArray();
      
      return giftCards.map(card => ({
        ...card,
        id: card._id,
      }));
    }),
});
