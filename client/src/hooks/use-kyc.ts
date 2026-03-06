import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";

type KycDocument = z.infer<typeof api.kyc.get.responses[200]>;
type SubmitKycRequest = z.infer<typeof api.kyc.submit.input>;
type KycList = z.infer<typeof api.kyc.list.responses[200]>;

export function useKyc() {
  return useQuery<KycDocument>({
    queryKey: [api.kyc.get.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.kyc.get.path);
      return res.json();
    },
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmitKycRequest) => {
      const res = await authenticatedFetch(api.kyc.submit.path, {
        method: api.kyc.submit.method,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.kyc.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.dashboardStats.path] });
    },
  });
}

export function useKycList() {
  return useQuery<KycList>({
    queryKey: [api.kyc.list.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.kyc.list.path);
      return res.json();
    },
  });
}

export function useAdminKycList() {
  return useQuery<KycList>({
    queryKey: [api.kyc.list.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.kyc.list.path);
      const data = await res.json();
      console.log("KYC List Data from API:", data);
      return data;
    },
  });
}

export function useUpdateKycStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.kyc.updateStatus.path, { id });
      const res = await authenticatedFetch(url, {
        method: api.kyc.updateStatus.method,
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all KYC related queries
      queryClient.invalidateQueries({ queryKey: [api.kyc.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.kyc.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Force refresh user data
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      
      // Force refetch immediately
      queryClient.refetchQueries({ queryKey: [api.kyc.list.path] });
      queryClient.refetchQueries({ queryKey: [api.auth.me.path] }); // Force refresh user data
    },
  });
}
