import React, { useState, useEffect } from "react";

export default function CloudflareVerify() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("cloudflare_verified");
    const expiryTime = localStorage.getItem("cloudflare_expiry");
    
    if (verified === "true" && expiryTime) {
      const expiry = new Date(expiryTime);
      const now = new Date();
      
      if (now < expiry) {
        setIsVerified(true);
        return;
      }
    }
  }, []);

  const handleVerify = async () => {
    if (isVerifying || isVerified) return;
    
    setIsVerifying(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    localStorage.setItem("cloudflare_verified", "true");
    localStorage.setItem("cloudflare_expiry", expiryTime.toISOString());
    
    setIsVerified(true);
    setIsVerifying(false);
    

    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  if (isVerified) {
    return (
      <>
        <style>{`
          *{
            margin:0;
            padding:0;
            box-sizing:border-box;
          }

          body{
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",
            Roboto,Helvetica,Arial,sans-serif;
            background:#ffffff;
            color:#222;
          }

          .page{
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
          }

          .success-box{
            text-align:center;
            padding:40px;
            max-width:400px;
          }

          .success-icon{
            width:60px;
            height:60px;
            margin:0 auto 20px;
            background:#4CAF50;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
          }

          .success-icon svg{
            width:30px;
            height:30px;
          }

          .success-title{
            font-size:24px;
            font-weight:600;
            margin-bottom:10px;
            color:#2E7D32;
          }

          .success-text{
            font-size:16px;
            color:#666;
          }
        `}</style>

        <div className="page">
          <div className="success-box">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="success-title">Verification Successful</div>
            <div className="success-text">Redirecting to login...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        body{
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",
          Roboto,Helvetica,Arial,sans-serif;
          background:#ffffff;
          color:#222;
        }

        .page{
          min-height:100vh;
          display:flex;
          align-items:center;
        }

        .content{
          width:100%;
          max-width:720px;
          margin-left:140px;
        }

        .domain{
          font-size:30px;
          font-weight:600;
          margin-bottom:10px;
        }

        .subtitle{
          font-size:19px;
          color:#444;
          margin-bottom:32px;
        }

        .verify-box{
          width:420px;
          background:#fff;
          border:1px solid #dadce0;
          border-radius:8px;
          padding:16px 18px;
          display:flex;
          align-items:center;
          gap:14px;
          cursor:pointer;
          transition:border-color 0.2s, box-shadow 0.2s;
        }

        .verify-box:hover{
          border-color:#1a73e8;
          box-shadow:0 1px 6px rgba(26,115,232,0.1);
        }

        .verify-box.verifying{
          border-color:#fbbc04;
          background:#fef7e0;
          cursor:not-allowed;
        }

        .checkbox{
          width:26px;
          height:26px;
          border:2px solid #c1c1c1;
          border-radius:4px;
          background:#fff;
          position:relative;
          transition:border-color 0.2s, background-color 0.2s;
        }

        .verify-box.verifying .checkbox{
          border-color:#fbbc04;
          background:#fff;
        }

        .verify-box.verifying .checkbox::after{
          content:'';
          position:absolute;
          top:50%;
          left:50%;
          width:16px;
          height:16px;
          margin:-8px 0 0 -8px;
          border:2px solid #fbbc04;
          border-top-color:transparent;
          border-radius:50%;
          animation:spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .verify-text{
          flex:1;
          font-size:15px;
        }

        .verify-box.verifying .verify-text{
          color:#5f6368;
        }

        .turnstile{
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          line-height:1.1;
        }

        .turnstile img{
          height:26px;
          opacity:1;
          transition:opacity 0.3s;
        }

        .verify-box.verifying .turnstile img{
          opacity:0.6;
        }

        .cf-name{
          font-size:12px;
          color:#555;
          margin-top:2px;
          font-weight:500;
        }

        .terms{
          font-size:11px;
          margin-top:2px;
        }

        .terms a{
          color:#777;
          text-decoration:none;
        }

        .terms a:hover{
          text-decoration:underline;
        }

        .footer{
          margin-top:22px;
          font-size:14px;
          color:#555;
          max-width:520px;
          line-height:1.5;
        }

        .why{
          margin-top:14px;
          font-size:14px;
        }

        .why a{
          color:#333;
          text-decoration:none;
        }

        .why a:hover{
          text-decoration:underline;
        }

        .bottom{
          position:fixed;
          bottom:20px;
          left:140px;
          font-size:13px;
          color:#888;
        }

        @media (max-width: 768px) {
          .content{
            margin-left:20px;
            margin-right:20px;
            max-width:100%;
          }

          .domain{
            font-size:24px;
          }

          .subtitle{
            font-size:16px;
          }

          .verify-box{
            width:100%;
            max-width:420px;
          }

          .bottom{
            left:20px;
            right:20px;
            text-align:center;
          }
        }

        @media (max-width: 480px) {
          .content{
            margin-left:16px;
            margin-right:16px;
          }

          .domain{
            font-size:20px;
          }

          .subtitle{
            font-size:14px;
            margin-bottom:24px;
          }

          .verify-box{
            padding:12px 14px;
            gap:12px;
          }

          .checkbox{
            width:22px;
            height:22px;
          }

          .verify-text{
            font-size:14px;
          }

          .footer{
            font-size:13px;
          }

          .bottom{
            font-size:12px;
            bottom:16px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .content{
            margin-left:80px;
            max-width:600px;
          }

          .verify-box{
            width:380px;
          }
        }

        @media (min-width: 1200px) {
          .content{
            margin-left:180px;
            max-width:800px;
          }

          .domain{
            font-size:32px;
          }

          .subtitle{
            font-size:20px;
          }

          .verify-box{
            width:460px;
          }
        }
      `}</style>

      <div className="page">
        <div className="content">

          <div className="domain">example.com</div>

          <div className="subtitle">
            Checking if the site connection is secure
          </div>

          <div className={`verify-box ${isVerifying ? 'verifying' : ''}`} onClick={handleVerify}>

            <div className="checkbox"></div>

            <div className="verify-text">
              {isVerifying ? 'Verifying...' : 'Verify you are human'}
            </div>

            <div className="turnstile">

              <img
                src="https://c-10-sketch.github.io/C-10-web/modified.png"
                alt="Cloudflare Turnstile"
              />

              <div className="cf-name">Cloudflare</div>

              <div className="terms">
                <a href="https://www.cloudflare.com/" target="_blank" rel="noreferrer">
                  Privacy
                </a>
                &nbsp;·&nbsp;
                <a href="https://www.cloudflare.com/" target="_blank" rel="noreferrer">
                  Terms
                </a>
              </div>

            </div>

          </div>

          <div className="footer">
            example.com needs to review the security of your connection before proceeding.
          </div>

          <div className="why">
            <a href="https://www.cloudflare.com/" target="_blank" rel="noreferrer">
              Why am I seeing this page?
            </a>
          </div>

        </div>
      </div>

      <div className="bottom">
        Performance & security by Cloudflare
      </div>
    </>
  );
}
