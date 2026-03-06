import { useState, useRef } from "react";
import { useKyc, useSubmitKyc } from "@/hooks/use-kyc";
import { Loader2, UploadCloud, CheckCircle, FileText, Camera, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { authenticatedFetch } from "@/lib/api-client";
import { api } from "@shared/routes";

export default function Kyc() {
  const { data: kycData, isLoading, refetch } = useKyc();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    idProof: null,
    selfie: null,
    addressProof: null
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    idProof: "",
    selfie: "",
    addressProof: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max size is 5MB" });
        return;
      }
      setFiles(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.idProof || !files.selfie || !files.addressProof) {
      toast({ variant: "destructive", title: "Missing files", description: "Please upload all required documents." });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("idProof", files.idProof);
      formData.append("selfie", files.selfie);
      formData.append("addressProof", files.addressProof);

      await authenticatedFetch(api.kyc.submit.path, {
        method: "POST",
        body: formData
      });

      toast({ title: "KYC Submitted", description: "Your documents are under review." });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission failed", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (kycData) {
    // If rejected, check if 24h passed to allow re-submission
    if (kycData.status === "Rejected") {
      const rejectedAt = kycData.createdAt ? new Date(kycData.createdAt).getTime() : 0;
      const now = new Date().getTime();
      const hoursPassed = (now - rejectedAt) / (1000 * 60 * 60);
      
      if (hoursPassed >= 24) {
        // Allow user to see the form again
        return (
          <div className="p-4 sm:p-8 max-w-3xl mx-auto animate-in fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground">Re-apply Verification</h1>
              <p className="text-muted-foreground mt-2">Your previous request was rejected. You can now re-submit your documents.</p>
            </div>
            {renderKycForm()}
          </div>
        );
      }
    }

    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto h-[80vh] flex items-center justify-center">
        <div className="glass-card p-8 sm:p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-display font-bold">KYC Status</h2>
          <div className="mt-4 mb-8 text-xl">
            <StatusBadge status={kycData.status} className="px-4 py-2 text-sm" />
          </div>
          <p className="text-muted-foreground">
            {kycData.status === "Approved" ? "Your identity is verified. You can now sell gift cards." : 
             kycData.status === "Verified" ? "Your identity is verified. You can now sell gift cards." :
             kycData.status === "Rejected" ? "Your documents were rejected. You can re-apply 24 hours after the rejection time." :
             "We are reviewing your documents. This usually takes 24 hours."}
          </p>
          {kycData.status === "Rejected" && (
            <div className="mt-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium mb-4">
                Available to re-apply in: {Math.max(0, Math.ceil(24 - ((new Date().getTime() - new Date(kycData.createdAt || 0).getTime()) / (1000 * 60 * 60))))} hours
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-colors"
              >
                Check status
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderKycForm = () => (
    <div className="glass-card p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* ID Proof */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Govt. ID Proof (Passport, Driver's License)
              </label>
              <div 
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all h-32 flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary/50 ${previews.idProof ? 'border-primary/50' : 'border-border/50'}`}
                onClick={() => document.getElementById('idProofInput')?.click()}
              >
                {previews.idProof ? (
                  <img src={previews.idProof} className="absolute inset-0 w-full h-full object-contain p-2" alt="ID Proof Preview" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground mt-2">Click to upload ID</span>
                  </>
                )}
                <input 
                  id="idProofInput" type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFileChange(e, 'idProof')}
                />
              </div>
            </div>

            {/* Selfie */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Selfie Photo
              </label>
              <div 
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all h-32 flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary/50 ${previews.selfie ? 'border-primary/50' : 'border-border/50'}`}
                onClick={() => document.getElementById('selfieInput')?.click()}
              >
                {previews.selfie ? (
                  <img src={previews.selfie} className="absolute inset-0 w-full h-full object-contain p-2" alt="Selfie Preview" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground mt-2">Click to upload Selfie</span>
                  </>
                )}
                <input 
                  id="selfieInput" type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                />
              </div>
            </div>

            {/* Address Proof */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Address Proof (Utility Bill)
              </label>
              <div 
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all h-32 flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary/50 ${previews.addressProof ? 'border-primary/50' : 'border-border/50'}`}
                onClick={() => document.getElementById('addressProofInput')?.click()}
              >
                {previews.addressProof ? (
                  <img src={previews.addressProof} className="absolute inset-0 w-full h-full object-contain p-2" alt="Address Proof Preview" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground mt-2">Click to upload Bill</span>
                  </>
                )}
                <input 
                  id="addressProofInput" type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFileChange(e, 'addressProof')}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover-lift disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Documents"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Identity Verification</h1>
        <p className="text-muted-foreground mt-2">Upload your documents to unlock selling.</p>
      </div>
      {renderKycForm()}
    </div>
  );
}
