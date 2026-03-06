import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, ShoppingBag, DollarSign, Clock, ShieldCheck, CreditCard, LayoutDashboard, LogOut, Menu, X, Package, Image } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/buy", label: "Buy Cards", icon: ShoppingBag },
    { href: "/sell", label: "Sell Cards", icon: DollarSign },
    { href: "/history", label: "History", icon: Clock },
    { href: "/payout", label: "Payout", icon: CreditCard },
    { href: "/kyc", label: "KYC", icon: ShieldCheck },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/sell-requests", label: "Sell Requests", icon: DollarSign },
    { href: "/admin/kyc", label: "KYC Approvals", icon: ShieldCheck },
    { href: "/admin/users", label: "Users", icon: Home },
    { href: "/admin/gift-cards", label: "Gift Cards", icon: Package },
    { href: "/admin/banners", label: "Banners", icon: Image },
  ];

  const links = user?.role === "SUPER_ADMIN" ? [...mainLinks, ...adminLinks] : mainLinks;

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border/50 shadow-xl shadow-black/5 z-50">
        <div className="p-6">
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CardXchange
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon size={20} className={isActive ? "text-primary" : ""} />
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/50 z-50 flex items-center justify-between px-4">
        <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          CardXchange
        </h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-foreground">
          <Menu size={24} />
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-card z-[70] shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="font-display font-bold text-lg">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {links.map((link) => {
                  const isActive = location === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"}`}
                    >
                      <Icon size={22} className={isActive ? "text-primary" : ""} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-border/50">
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-4 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={22} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          {mainLinks.slice(0, 4).map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full space-y-1">
                <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
