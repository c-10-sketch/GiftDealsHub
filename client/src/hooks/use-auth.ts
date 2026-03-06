import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authenticatedFetch } from "@/lib/api-client";
import { z } from "zod";
import { useLocation } from "wouter";

type User = z.infer<typeof api.auth.me.responses[200]>;
type LoginRequest = z.infer<typeof api.auth.login.input>;
type RegisterRequest = z.infer<typeof api.auth.register.input>;

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      try {
        const res = await authenticatedFetch(api.auth.me.path);
        return await res.json();
      } catch (err) {
        localStorage.removeItem("auth_token");
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to login");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      setLocation("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to register");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData([api.auth.me.path], data.user);
      setLocation("/");
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData([api.auth.me.path], null);
    queryClient.clear();
    setLocation("/login");
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
