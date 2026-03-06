import { useState, useEffect } from "react";

export function useCloudflareVerification() {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if user is already verified
    const verified = localStorage.getItem("cloudflare_verified");
    const expiryTime = localStorage.getItem("cloudflare_expiry");
    
    if (verified === "true" && expiryTime) {
      const expiry = new Date(expiryTime);
      const now = new Date();
      
      // Check if verification is still valid (within 24 hours)
      if (now < expiry) {
        setIsVerified(true);
        setNeedsVerification(false);
        return;
      } else {
        // Clear expired verification
        localStorage.removeItem("cloudflare_verified");
        localStorage.removeItem("cloudflare_verified_time");
        localStorage.removeItem("cloudflare_expiry");
      }
    }
    
    // Check if this is first visit in current session
    const hasVisitedInSession = sessionStorage.getItem("cloudflare_session_verified");
    if (!hasVisitedInSession) {
      setNeedsVerification(true);
    }
  }, []);

  const handleVerification = () => {
    setIsVerified(true);
    setNeedsVerification(false);
    sessionStorage.setItem("cloudflare_session_verified", "true");
  };

  return {
    needsVerification,
    isVerified,
    handleVerification,
  };
}
