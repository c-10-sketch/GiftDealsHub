import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";
import Payout from "./pages/Payout";
import Kyc from "./pages/Kyc";
import History from "./pages/History";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminSellRequests from "./pages/admin/SellRequests";
import AdminKycRequests from "./pages/admin/KycRequests";
import AdminUsers from "./pages/admin/Users";
import AdminGiftCards from "./pages/admin/GiftCards";
import AdminBanners from "./pages/admin/Banners";

import { Navigation } from "./components/Navigation";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground md:pl-64 pt-16 md:pt-0 pb-16 md:pb-0">
      <Navigation />
      <main className="w-full h-full min-h-[calc(100vh-4rem)] md:min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/">
        <ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/buy">
        <ProtectedRoute><AppLayout><Buy /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/sell">
        <ProtectedRoute><AppLayout><Sell /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/payout">
        <ProtectedRoute><AppLayout><Payout /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/kyc">
        <ProtectedRoute><AppLayout><Kyc /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute><AppLayout><History /></AppLayout></ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute requireAdmin><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/admin/sell-requests">
        <ProtectedRoute requireAdmin><AppLayout><AdminSellRequests /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/admin/kyc">
        <ProtectedRoute requireAdmin><AppLayout><AdminKycRequests /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requireAdmin><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/admin/gift-cards">
        <ProtectedRoute requireAdmin><AppLayout><AdminGiftCards /></AppLayout></ProtectedRoute>
      </Route>
      <Route path="/admin/banners">
        <ProtectedRoute requireAdmin><AppLayout><AdminBanners /></AppLayout></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
