import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";

type PayoutDetails = z.infer<typeof api.payoutDetails.get.responses[200]>;
type SavePayoutRequest = z.infer<typeof api.payoutDetails.save.input>;

export function usePayout(userId?: number) {
  return useQuery<PayoutDetails | null>({
    queryKey: [api.payoutDetails.get.path, userId],
    queryFn: async () => {
      const url = userId ? `/api/admin/payout-details/${userId}` : api.payoutDetails.get.path;
      const res = await authenticatedFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch payout details");
      return res.json();
    },
  });
}

export function usePayoutDetails() {
  return useQuery<PayoutDetails>({
    queryKey: [api.payoutDetails.get.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.payoutDetails.get.path);
      return res.json();
    },
  });
}

export function useSavePayoutDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SavePayoutRequest) => {
      const res = await authenticatedFetch(api.payoutDetails.save.path, {
        method: api.payoutDetails.save.method,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.payoutDetails.get.path] });
    },
  });
}
