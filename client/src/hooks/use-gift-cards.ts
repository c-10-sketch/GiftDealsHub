import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";

type GiftCard = z.infer<typeof api.giftCards.list.responses[200]>[0];

export function useGiftCards() {
  return useQuery<GiftCard[]>({
    queryKey: [api.giftCards.list.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.giftCards.list.path);
      return res.json();
    },
  });
}
