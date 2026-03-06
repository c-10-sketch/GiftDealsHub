import { useSellRequests, useUpdateSellRequestStatus } from "@/hooks/use-sell-requests";
import { useUsers } from "@/hooks/use-admin";
import { Loader2, Check, X, User, Eye } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/api-client";

// Hook to fetch payout details
const usePayoutDetails = (userId: number) => {
  return useQuery({
    queryKey: ['payoutDetails', userId],
    queryFn: async () => {
      const response = await authenticatedFetch(`/api/admin/payout-details/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });
};

export default function AdminSellRequests() {
  const { data: requests, isLoading } = useSellRequests();
  const { data: users } = useUsers();
  const { mutateAsync: updateStatus } = useUpdateSellRequestStatus();
  const { toast } = useToast();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [viewingDetails, setViewingDetails] = useState<any>(null);
  const [note, setNote] = useState("");
  
  // Fetch payout details when viewing details
  const { data: payoutDetails } = usePayoutDetails(viewingDetails?.userId);

  const handleAction = async (mongoId: string, status: string, rejectionNote?: string) => {
    try {
      // Find request using MongoDB _id (not numeric id)
      const targetRequest = requests?.find(req => req._id === mongoId);
      
      if (!targetRequest) {
        toast({ title: "Error", description: "Sell request not found" });
        return;
      }

      await updateStatus({ id: mongoId, status, rejectionNote });
      toast({ title: "Status Updated", description: `Sell request marked as ${status}.` });
      setRejectingId(null);
      setNote("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status" });
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Manage Sell Requests</h1>
        <p className="text-muted-foreground mt-1">Review and process gift card submissions from users.</p>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              <th className="p-4 font-semibold text-muted-foreground">User</th>
              <th className="p-4 font-semibold text-muted-foreground">Brand</th>
              <th className="p-4 font-semibold text-muted-foreground">Card Info</th>
              <th className="p-4 font-semibold text-muted-foreground">Balance</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests?.map((req) => {
              const user = users?.find(u => u.id === req.userId);
              return (
                <tr key={req.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="font-medium">{user?.fullName || `User #${req.userId}`}</div>
                        <div className="text-xs text-muted-foreground">{user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{req.brandName || 'Unknown'}</td>
                  <td className="p-4">
                    <div className="font-mono text-sm">
                      {req.cardNumber ? `****${req.cardNumber.slice(-4)}` : '********'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PIN: {req.cardPin || '****'} • Exp: {req.expiryDate || 'Unknown'}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">${req.balance || '0.00'}</td>
                  <td className="p-4"><StatusBadge status={req.status || 'pending'} /></td>
                  <td className="p-4 text-right">
                    {rejectingId !== req._id ? (
                      <div className="flex justify-end gap-2">
                        {/* Show View Details for approved and pending requests - NOT rejected */}
                        {(req.status?.toLowerCase() === "approved" || req.status?.toLowerCase() === "pending" || !req.status) && (
                          <button onClick={() => setViewingDetails(req)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="View Details">
                            <Eye size={18} />
                          </button>
                        )}
                        {/* Show approve/reject only for pending requests */}
                        {(req.status?.toLowerCase() === "pending" || !req.status) && (
                          <>
                            <button onClick={() => handleAction(req._id, "Approved")} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Approve">
                              <Check size={18} />
                            </button>
                            <button onClick={() => setRejectingId(req._id)} className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors" title="Reject">
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (req.status?.toLowerCase() === "pending" || !req.status) && rejectingId === req._id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <input 
                          type="text" placeholder="Reason..." value={note} onChange={e=>setNote(e.target.value)}
                          className="px-2 py-1 text-sm border rounded bg-background max-w-[120px]"
                        />
                        <button onClick={() => handleAction(req._id, "Rejected", note)} className="px-3 py-1 text-xs bg-rose-500 text-white rounded font-medium hover:bg-rose-600 transition-colors">Confirm</button>
                        <button onClick={() => setRejectingId(null)} className="px-3 py-1 text-xs bg-secondary rounded font-medium hover:bg-secondary/80 transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <div className="text-right text-sm text-muted-foreground">
                        {req.status?.toLowerCase() === "approved" && <span className="text-emerald-600">Approved</span>}
                        {req.status?.toLowerCase() === "rejected" && <span className="text-rose-600">Rejected</span>}
                        {req.status?.toLowerCase() === "pending" && <span className="text-yellow-600">Pending</span>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {(!requests || requests.length === 0) && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground italic">No sell requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Details Modal */}
      {viewingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Sell Request Details</h3>
                <button 
                  onClick={() => setViewingDetails(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg mb-3 text-blue-600">💳 Card Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">🏷️ Brand:</span>
                      <span className="font-medium">{viewingDetails.brandName || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💳 Card Number:</span>
                      <span className="font-mono">{viewingDetails.cardNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🔑 PIN:</span>
                      <span className="font-mono">{viewingDetails.cardPin || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💰 Balance:</span>
                      <span className="font-bold text-emerald-600">${viewingDetails.balance || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">📅 Expiry Date:</span>
                      <span className="font-medium">{viewingDetails.expiryDate || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                {/* User Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg mb-3 text-green-600">👤 User Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">👤 Name:</span>
                      <span className="font-medium">{users?.find(u => u.id === viewingDetails.userId)?.fullName || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">📧 Email:</span>
                      <span className="font-medium">{users?.find(u => u.id === viewingDetails.userId)?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">📱 Phone:</span>
                      <span className="font-medium">{users?.find(u => u.id === viewingDetails.userId)?.phoneNumber || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Bank Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg mb-3 text-purple-600">🏦 Bank Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">👤 Account Holder Name:</span>
                      <span className="font-medium">{payoutDetails?.accountHolderName || payoutDetails?.accountName || viewingDetails.bankAccountName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🏦 Account Number:</span>
                      <span className="font-mono">{payoutDetails?.accountNumber || viewingDetails.bankAccountNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🏛️ Bank Name:</span>
                      <span className="font-medium">{payoutDetails?.bankName || viewingDetails.bankName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🔢 Routing Number / IFSC:</span>
                      <span className="font-mono">{payoutDetails?.routingNumber || payoutDetails?.ifscCode || viewingDetails.ifscCode || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
