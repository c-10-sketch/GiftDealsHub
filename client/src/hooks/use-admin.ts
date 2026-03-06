import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";

type DashboardStats = z.infer<typeof api.admin.dashboardStats.responses[200]>;
type UserList = z.infer<typeof api.admin.users.responses[200]>;

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: [api.admin.dashboardStats.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.admin.dashboardStats.path);
      return res.json();
    },
  });
}

export function useUsers() {
  return useQuery<UserList>({
    queryKey: [api.admin.users.path],
    queryFn: async () => {
      const res = await authenticatedFetch(api.admin.users.path);
      return res.json();
    },
  });
}
