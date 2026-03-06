import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Compass, Ghost, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      setPosition({
        x: (clientX - centerX) * 0.03,
        y: (clientY - centerY) * 0.03
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGhostPosition({
        x: Math.random() * (isMobile ? 10 : 20) - (isMobile ? 5 : 10),
        y: Math.random() * (isMobile ? 10 : 20) - (isMobile ? 5 : 10)
      });
    }, isMobile ? 3000 : 2000);

    return () => clearInterval(interval);
  }, [isMobile]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-5 sm:top-20 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-20 animate-float animation-delay-4000"></div>
      </div>

      <div 
        className="absolute text-[8rem] sm:text-[12rem] md:text-[20rem] font-black text-white/5 select-none pointer-events-none hidden xs:block"
        style={{
          transform: !isMobile ? `translate(${position.x}px, ${position.y}px) rotate(${position.x * 0.1}deg)` : 'none'
        }}
      >
        404
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <Compass className="absolute top-10 left-10 sm:top-20 sm:left-1/4 h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white/10 animate-spin-slow" />
        <Ghost className="absolute bottom-10 right-10 sm:bottom-20 sm:right-1/4 h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-white/10 animate-bounce" />
        <MapPin className="absolute top-20 right-10 sm:top-40 sm:right-1/3 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white/10 animate-pulse" />
      </div>

      <Card className="w-full max-w-[90%] xs:max-w-md sm:max-w-lg mx-auto bg-white/95 backdrop-blur-lg shadow-2xl border-0 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl hidden sm:block"></div>
        
        <div className="relative bg-white/90 backdrop-blur-sm m-[1px] rounded-lg">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient bg-[length:200%_200%]"></div>
          
          <CardContent className="pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 md:px-8">
            <div className="relative flex justify-center mb-4 sm:mb-6 md:mb-8">
              <div 
                className="absolute inset-0 flex items-center justify-center animate-ping opacity-30"
                style={{ animationDuration: '3s' }}
              >
                <Ghost className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-purple-500" />
              </div>
              <div 
                className="relative transition-transform duration-2000 ease-in-out"
                style={{
                  transform: `translate(${ghostPosition.x}px, ${ghostPosition.y}px)`
                }}
              >
                <Ghost className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 text-purple-600" />
              </div>
              
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 bg-purple-400 rounded-full animate-ping opacity-75 animation-delay-1000"></div>
            </div>

            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-black mb-2 sm:mb-3 md:mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                  404
                </span>
              </h1>
              
              <div className="relative inline-block mb-2 sm:mb-3 md:mb-4">
                <h2 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 relative z-10 px-2">
                  Page Not Found
                </h2>
                <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 bg-purple-200/50 -skew-y-2"></div>
              </div>

              <p className="text-gray-600 text-sm xs:text-base sm:text-base md:text-lg leading-relaxed px-2">
                Oops! This page has wandered off into the digital void. 
                <br className="hidden xs:block" />
                <span className="text-purple-600 font-medium"> Don't worry</span>, even ghosts get lost sometimes! 👻
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8 border border-purple-100 shadow-inner">
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold text-purple-700">Quick tip:</span> The page you're looking for might have been moved, deleted, or never existed. Let's get you back on track!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
              <Button 
                variant="outline" 
                className="group/back relative overflow-hidden bg-transparent border-2 border-purple-500 hover:border-purple-600 transition-all duration-300 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base"
                onClick={() => window.history.back()}
              >
                <span className="absolute inset-0 bg-purple-500 transform scale-x-0 group-hover/back:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative flex items-center justify-center gap-1 sm:gap-2 text-purple-600 group-hover/back:text-white transition-colors duration-300">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  Go Back
                </span>
              </Button>

              <Button 
                className="group/home relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base"
                onClick={() => window.location.href = '/'}
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover/home:opacity-20 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-1 sm:gap-2">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  Go Home
                </span>
              </Button>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 text-center">
              <button 
                onClick={() => {
                  const messages = [
                    "👻 Boo! You found me!",
                    "✨ Even 404 pages have secrets!",
                    "🌟 You're a true explorer!",
                    "🎯 You found the hidden message!",
                    "📱 Mobile magic! ✨",
                    "🫶 Thanks for visiting!"
                  ];
                  alert(messages[Math.floor(Math.random() * messages.length)]);
                }}
                className="text-xs sm:text-sm text-gray-400 hover:text-purple-500 transition-colors duration-300 cursor-help px-4 py-2 min-h-[44px] flex items-center justify-center"
              >
                ✦ Don't panic ✦
              </button>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
                This page is intentionally left spooky
              </p>
            </div>
          </CardContent>
        </div>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.1); }
          66% { transform: translate(-15px, 15px) scale(0.9); }
        }
        
        .animate-float {
          animation: float 10s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        @media (min-width: 400px) {
          .xs\\:block {
            display: block;
          }
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:max-w-md {
            max-width: 28rem;
          }
          .xs\\:text-base {
            font-size: 1rem;
          }
          .xs\\:text-6xl {
            font-size: 3.75rem;
          }
          .xs\\:text-2xl {
            font-size: 1.5rem;
          }
        }
        
        button {
          min-height: 44px;
          min-width: 44px;
        }
        
        @media (max-width: 360px) {
          .text-5xl {
            font-size: 2.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}