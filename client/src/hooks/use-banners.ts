import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";

type Banner = z.infer<typeof api.banners.list.responses[200]>[0];
type CreateBannerRequest = z.infer<typeof api.banners.create.input>;

export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: [api.banners.list.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.banners.list.path);
      return res.json();
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBannerRequest) => {
      const res = await authenticatedFetch(api.banners.create.path, {
        method: api.banners.create.method,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.banners.list.path] });
    },
  });
}
