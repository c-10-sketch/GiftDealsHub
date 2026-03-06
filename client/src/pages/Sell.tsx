import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateSellRequest } from "@/hooks/use-sell-requests";
import { Loader2, ShieldAlert, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Sell() {
  const { user } = useAuth();
  const { mutateAsync: createSellRequest, isPending } = useCreateSellRequest();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    brandName: "", cardNumber: "", cardPin: "", balance: "", expiryDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Submitting sell request:", formData);
      await createSellRequest(formData);
      toast({ title: "Request Submitted", description: "Your gift card is being reviewed." });
      setLocation("/history");
    } catch (err: any) {
      console.error("Sell request error:", err);
      toast({ variant: "destructive", title: "Submission failed", description: err.message || "An unexpected error occurred" });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Sell Gift Card</h1>
        <p className="text-muted-foreground mt-2">Enter your card details securely to get cash.</p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Brand Name</label>
              <input 
                type="text" required placeholder="e.g., Amazon, iTunes"
                value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})}
                className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input 
                    type="text" required placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">PIN / Security Code</label>
                <input 
                  type="text" required placeholder="PIN"
                  value={formData.cardPin} onChange={e => setFormData({...formData, cardPin: e.target.value})}
                  className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Card Balance ($)</label>
                <input 
                  type="number" required placeholder="0.00" step="0.01" min="1"
                  value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})}
                  className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                <input 
                  type="text" required placeholder="MM/YY or Lifetime"
                  value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover-lift disabled:opacity-50 flex items-center justify-center"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Verification"}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              By submitting, you confirm these details are accurate and the card is legally yours.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
