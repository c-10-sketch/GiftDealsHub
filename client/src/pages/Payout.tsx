import { useState, useEffect } from "react";
import { usePayoutDetails, useSavePayoutDetails } from "@/hooks/use-payout";
import { Loader2, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payout() {
  const { data: currentDetails, isLoading } = usePayoutDetails();
  const { mutateAsync: saveDetails, isPending } = useSavePayoutDetails();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    accountHolderName: "", bankName: "", accountNumber: "", ifscCode: ""
  });

  useEffect(() => {
    if (currentDetails) {
      setFormData({
        accountHolderName: currentDetails.accountHolderName,
        bankName: currentDetails.bankName,
        accountNumber: currentDetails.accountNumber,
        ifscCode: currentDetails.ifscCode
      });
    }
  }, [currentDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDetails(formData);
      toast({ title: "Saved Successfully", description: "Your payout details have been updated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto animate-in fade-in">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Landmark size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Payout Details</h1>
          <p className="text-muted-foreground mt-1">Where should we send your money?</p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Account Holder Name</label>
              <input 
                type="text" required 
                value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})}
                className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bank Name</label>
              <input 
                type="text" required 
                value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})}
                className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Account Number</label>
              <input 
                type="text" required 
                value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Routing Number / IFSC</label>
              <input 
                type="text" required 
                value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})}
                className="w-full px-4 py-3 bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover-lift disabled:opacity-50 flex items-center justify-center"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Bank Details"}
          </button>
        </form>
      </div>
    </div>
  );
}
