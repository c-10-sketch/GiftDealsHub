import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";

type SellRequest = z.infer<typeof api.sellRequests.list.responses[200]>[0];
type CreateSellRequest = z.infer<typeof api.sellRequests.create.input>;

export function useSellRequests() {
  return useQuery<SellRequest[]>({
    queryKey: [api.sellRequests.list.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.sellRequests.list.path);
      return res.json();
    },
  });
}

export function useMySellRequests() {
  return useQuery<SellRequest[]>({
    queryKey: [api.sellRequests.list.path, "my"],
    queryFn: async () => {
      const res = await authenticatedFetch(api.sellRequests.list.path);
      return res.json();
    },
  });
}

export function useCreateSellRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSellRequest) => {
      const res = await authenticatedFetch(api.sellRequests.create.path, {
        method: api.sellRequests.create.method,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      console.log("Sell request update successful:", { data, variables });
      
      // Update cache immediately for instant UI feedback
      queryClient.setQueryData([api.sellRequests.list.path], (old: any) =>
        old?.map((req: any) =>
          req._id === variables.id
            ? { ...req, status: variables.status }  // Update the specific request
            : req  // Keep others unchanged
        )
      );
      
      queryClient.invalidateQueries({ queryKey: [api.sellRequests.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.dashboardStats.path] });
    },
  });
}

export function useUpdateSellRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, rejectionNote }: { id: number; status: string; rejectionNote?: string }) => {
      const url = buildUrl(api.sellRequests.updateStatus.path, { id });
      const res = await authenticatedFetch(url, {
        method: api.sellRequests.updateStatus.method,
        body: JSON.stringify({ status, rejectionNote }),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      console.log("Sell request update successful:", { data, variables });
      
      // Update cache immediately for instant UI feedback
      queryClient.setQueryData([api.sellRequests.list.path], (old: any) =>
        old?.map((req: any) =>
          req._id === variables.id
            ? { ...req, status: variables.status }  // Update the specific request
            : req  // Keep others unchanged
        )
      );
      
      queryClient.invalidateQueries({ queryKey: [api.sellRequests.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.dashboardStats.path] });
    },
  });
}
