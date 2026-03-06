import { useMySellRequests } from "@/hooks/use-sell-requests";
import { Loader2, CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

export default function History() {
  const { data: requests, isLoading } = useMySellRequests();
  
  // Sort by createdAt in descending order (newest first)
  const sortedRequests = requests?.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  }) || [];

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground mt-2">Track the status of your gift card sales.</p>
      </div>

      <div className="space-y-4">
        {!requests || requests.length === 0 ? (
          <div className="glass-card p-12 text-center text-muted-foreground">
            You haven't submitted any sell requests yet.
          </div>
        ) : (
          sortedRequests.map((req) => (
            <div key={req.id} className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover-lift">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-xl text-foreground mt-1">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{req.brandName || 'Unknown Brand'} Gift Card</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="font-mono">
                      {req.cardNumber ? `****${req.cardNumber.slice(-4)}` : '********'}
                    </span>
                    <span>•</span>
                    <span>
                      {req.createdAt 
                        ? format(new Date(req.createdAt), 'MMM d, yyyy')
                        : 'Unknown Date'
                      }
                    </span>
                  </div>
                  {req.rejectionNote && req.status?.toLowerCase() === "rejected" && (
                    <p className="text-xs text-destructive mt-2 bg-destructive/10 p-2 rounded-md">
                      Reason: {req.rejectionNote}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0">
                <span className="font-display font-bold text-xl">${req.balance || '0.00'}</span>
                <div className="sm:mt-2">
                  <StatusBadge status={req.status || 'pending'} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
