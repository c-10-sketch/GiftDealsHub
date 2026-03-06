import { useUsers } from "@/hooks/use-admin";
import { Loader2, ShieldCheck, ShieldAlert, Search, User, CreditCard, FileText } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { useKycList } from "@/hooks/use-kyc";
import { usePayout } from "@/hooks/use-payout";
import { useSellRequests } from "@/hooks/use-sell-requests";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminUsers() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: kycDocs } = useKycList();
  const { data: sellRequests } = useSellRequests();
  const [searchTerm, setSearchTerm] = useState("");

  if (usersLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const filteredUsers = users?.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toString() === searchTerm ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all registered users.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="p-4 font-semibold text-muted-foreground">ID</th>
                <th className="p-4 font-semibold text-muted-foreground">Name</th>
                <th className="p-4 font-semibold text-muted-foreground">Contact</th>
                <th className="p-4 font-semibold text-muted-foreground">Role</th>
                <th className="p-4 font-semibold text-muted-foreground">KYC Status</th>
                <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <td className="p-4 font-mono text-sm">#{u.id}</td>
                  <td className="p-4 font-medium">{u.fullName}</td>
                  <td className="p-4">
                    <div className="text-sm">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.phoneNumber}</div>
                  </td>
                  <td className="p-4"><StatusBadge status={u.role} /></td>
                  <td className="p-4">
                    {u.isKycVerified ? (
                      <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        <img 
                          src="https://c-10-sketch.github.io/C-10-web/premium.png" 
                          alt="Verified" 
                          className="w-4 h-4"
                        />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm font-medium bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full w-max"><ShieldAlert size={14}/> Unverified</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <UserDetailDialog 
                      user={u} 
                      kycDoc={kycDocs?.find(d => d.userId === u.id)}
                      sells={sellRequests?.filter(s => s.userId === u.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserDetailDialog({ user, kycDoc, sells }: { user: any, kycDoc?: any, sells?: any[] }) {
  const { data: allKyc } = useKycList();
  const { data: allSells } = useSellRequests();
  const userKyc = kycDoc || allKyc?.find((d: any) => d.userId === user.id);
  const userSells = sells || allSells?.filter((s: any) => s.userId === user.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors">
          View Details
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <User className="text-primary" />
            User Details: {user.fullName}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kyc">KYC Docs</TabsTrigger>
            <TabsTrigger value="bank">Bank Info</TabsTrigger>
            <TabsTrigger value="sells">Sell History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Phone</p>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Role</p>
                <StatusBadge status={user.role} />
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Joined</p>
                <p className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kyc" className="p-4">
            {userKyc ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="text-primary" size={18} />
                    Verification Documents
                  </h3>
                  <StatusBadge status={userKyc.status} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">ID Proof</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border">
                      <img src={userKyc.idProofUrl} alt="ID Proof" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">Selfie</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border">
                      <img src={userKyc.selfieUrl} alt="Selfie" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-center">Address Proof</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border">
                      <img src={userKyc.addressProofUrl} alt="Address Proof" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldAlert className="mx-auto mb-2 opacity-20" size={48} />
                <p>No KYC documents submitted yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bank" className="p-4">
             <BankDetailsView userId={user.id} />
          </TabsContent>

          <TabsContent value="sells" className="p-4">
            {userSells && userSells.length > 0 ? (
              <div className="space-y-3">
                {userSells.map((s: any) => (
                  <div key={s.id} className="p-4 bg-secondary/30 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{s.brandName}</p>
                      <p className="text-xs text-muted-foreground">#{s.cardNumber.slice(-4).padStart(s.cardNumber.length, '*')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">${s.balance}</p>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="mx-auto mb-2 opacity-20" size={48} />
                <p>No card sales yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function BankDetailsView({ userId }: { userId: number }) {
  const { data: payout } = usePayout(userId);
  
  if (!payout) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CreditCard className="mx-auto mb-2 opacity-20" size={48} />
        <p>No bank details provided.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <CreditCard className="text-primary" size={18} />
        Payout Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border rounded-lg">
          <p className="text-xs text-muted-foreground uppercase">Account Holder</p>
          <p className="font-medium">{payout.accountHolderName}</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-xs text-muted-foreground uppercase">Bank Name</p>
          <p className="font-medium">{payout.bankName}</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-xs text-muted-foreground uppercase">Account Number</p>
          <p className="font-medium font-mono">{payout.accountNumber}</p>
        </div>
        <div className="p-3 border rounded-lg">
          <p className="text-xs text-muted-foreground uppercase">IFSC Code</p>
          <p className="font-medium font-mono">{payout.ifscCode}</p>
        </div>
      </div>
    </div>
  );
}
