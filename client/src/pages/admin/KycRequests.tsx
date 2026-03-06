import { useAdminKycList, useUpdateKycStatus } from "@/hooks/use-kyc";
import { useUsers } from "@/hooks/use-admin";
import { Loader2, Check, X, ExternalLink, Filter, Search } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminKycRequests() {
  const { data: requests, isLoading } = useAdminKycList();
  const { data: users } = useUsers();
  const { mutateAsync: updateStatus } = useUpdateKycStatus();
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = async (mongoId: string, status: string) => {
    try {
      console.log("Updating KYC status:", { mongoId, status });
      
      await updateStatus({ id: mongoId, status });
      toast({ title: "Status Updated", description: `KYC marked as ${status}.` });
    } catch (err: any) {
      console.error("KYC update error:", err);
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to update status" });
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const filteredRequests = requests?.filter(req => {
    const user = users?.find(u => u.id === req.userId);
    const matchesFilter = filter === "All" || req.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userId.toString() === searchTerm;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">KYC Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and verify user identity documents.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" placeholder="Search user or ID..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl border border-border w-full sm:w-auto">
            {["All", "Pending", "Verified", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(!filteredRequests || filteredRequests.length === 0) && (
          <div className="col-span-full glass-card p-12 text-center text-muted-foreground italic">No KYC requests matching your criteria.</div>
        )}
        
        {filteredRequests?.map((req) => {
          const user = users?.find(u => u.id === req.userId);
          console.log("Processing KYC request:", { _id: req._id, userId: req.userId, status: req.status });
          return (
            <div key={`kyc-${req._id}-${req.userId}`} className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user?.fullName?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{user?.fullName || `User #${req.userId}`}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email || 'N/A'}</p>
                  </div>
                </div>
                <StatusBadge status={req.status || 'pending'} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <a href={req.idProofUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-center text-[10px] uppercase tracking-wider font-bold gap-2 group">
                  <ExternalLink size={14} className="text-primary group-hover:scale-110 transition-transform" /> ID Proof
                </a>
                <a href={req.selfieUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-center text-[10px] uppercase tracking-wider font-bold gap-2 group">
                  <ExternalLink size={14} className="text-primary group-hover:scale-110 transition-transform" /> Selfie
                </a>
                <a href={req.addressProofUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors text-center text-[10px] uppercase tracking-wider font-bold gap-2 group">
                  <ExternalLink size={14} className="text-primary group-hover:scale-110 transition-transform" /> Address
                </a>
              </div>

              {(req.status?.toLowerCase() === "pending" || !req.status) && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-border/50">
                  <button onClick={() => handleAction(req._id, "Verified")} className="flex-1 py-2.5 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                    <Check size={18} /> Approve
                  </button>
                  <button onClick={() => handleAction(req._id, "Rejected")} className="flex-1 py-2.5 bg-rose-100 text-rose-700 font-bold rounded-xl hover:bg-rose-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                    <X size={18} /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
