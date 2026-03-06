import { useAuth } from "@/hooks/use-auth";
import { useBanners } from "@/hooks/use-banners";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, ArrowRight, Tag, Loader2, Gift, TrendingUp, Sparkles, CreditCard, Zap, Shield, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const shineAnimation = `
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shine {
    animation: shine 2s ease-in-out infinite;
  }
`;

interface GiftCard {
  id: number;
  name: string;
  description: string;
  discount: number;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { user } = useAuth();
  const { data: banners } = useBanners();
  const { data: cards = [], isLoading: isLoadingCards } = useQuery({
    queryKey: ["gift-cards-public"],
    queryFn: async () => {
      const response = await fetch("/api/gift-cards");
      if (!response.ok) {
        throw new Error("Failed to fetch gift cards");
      }
      return response.json();
    },
  });

  const { toast } = useToast();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const activeBanners = banners?.filter(b => b.isActive) || [];

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % activeBanners.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const goToBanner = (index: number) => {
    setCurrentBannerIndex(index);
  };

  const nextBanner = () => {
    if (activeBanners.length > 1) {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % activeBanners.length
      );
    }
  };

  const prevBanner = () => {
    if (activeBanners.length > 1) {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
      );
    }
  };

  const handleBuyClick = () => {
    toast({ 
      title: "Coming Soon", 
      description: "Purchasing gift cards will be available in the next update!",
      duration: 3000,
    });
  };

  const featuredCards = cards?.filter(c => c.isActive).slice(0, 10) || [];
  
  const sortedCards = [...featuredCards].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = [
    { icon: CreditCard, label: "Active Cards", value: cards.filter(c => c.isActive).length },
    { icon: TrendingUp, label: "Best Deals", value: "Up to 50%" },
    { icon: Zap, label: "Instant Delivery", value: "24/7" },
    { icon: Shield, label: "Secure", value: "100%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Welcome Back</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground">
                Hello, {user?.fullName.split(' ')[0]} 
                {(user?.isKycVerified || user?.kycVerified) ? (
                  <span className="ml-3 inline-flex items-center gap-1">
                    <div className="relative">
                      <img 
                        src="./premium.png" 
                        alt="Verified" 
                        className="w-6 h-6 inline-block animate-pulse"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                    </div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  </span>
                ) : (
                  <span className="ml-3 inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                    <span>👋</span>
                    New User
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">Ready to trade some gift cards today?</p>
            </div>
            {!(user?.isKycVerified || user?.kycVerified) && (
              <Link 
                href="/kyc" 
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white font-semibold rounded-2xl shadow-2xl shadow-amber-600/30 hover:shadow-amber-600/50 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                
                <span className="relative flex items-center gap-2">
                  <ShieldAlert size={20} className="animate-pulse" />
                  <span>Complete KYC to sell cards</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            )}
          </div>
        </div>

        {activeBanners.length > 0 && (
          <div className="relative w-full h-48 sm:h-72 rounded-2xl overflow-hidden shadow-2xl group">
            <div className="relative w-full h-full">
              {activeBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      console.error("Banner image failed to load:", banner.imageUrl);
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <div class="text-center">
                              <div class="text-4xl mb-2">🎨</div>
                              <p class="text-foreground font-semibold">${banner.title}</p>
                              <p class="text-muted-foreground text-sm">Banner image unavailable</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
                        {banner.type || 'Featured'}
                      </span>
                    </div>
                    <h2 className="text-white text-3xl font-bold font-display mb-2">{banner.title}</h2>
                    {banner.link && (
                      <a 
                        href={banner.link} 
                        className="inline-flex items-center gap-2 mt-2 text-white bg-primary/90 backdrop-blur-md px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary transition-colors group"
                      >
                        Learn More
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {activeBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToBanner(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentBannerIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Featured Cards
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {Math.min(10, cards.filter(c => c.isActive).length)} of {cards.filter(c => c.isActive).length} available cards
              </p>
            </div>
            <Link 
              href="/buy" 
              className="text-primary text-sm font-semibold flex items-center gap-2 hover:underline group"
            >
              View All {cards.filter(c => c.isActive).length} Cards
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {isLoadingCards ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card/30 rounded-3xl border border-dashed">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading amazing deals...</p>
            </div>
          ) : featuredCards.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-gradient-to-br from-card/50 to-card/30 rounded-3xl border border-dashed">
              <Gift className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Browse our selection of discounted gift cards in the Store.</p>
              <Link 
                href="/buy" 
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                Go to Store
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
              {sortedCards.map((card, index) => (
                <div 
                  key={card.id} 
                  className="glass-card overflow-hidden group hover-lift flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-40 bg-gradient-to-br from-secondary to-secondary/50 overflow-hidden">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    {parseFloat(card.discount) > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-lg animate-in zoom-in">
                        <Tag size={12} className="mr-1" style={{ mixBlendMode: 'multiply' }} />
                        {card.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-base text-foreground truncate">{card.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground line-through">${(card.price * 1.2).toFixed(2)}</p>
                        <div className="font-bold text-xl text-primary">${card.price}</div>
                      </div>
                      <button 
                        onClick={handleBuyClick}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 flex items-center gap-1"
                      >
                        Buy
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold mb-1">Instant Delivery</h3>
            <p className="text-xs text-muted-foreground">Get your gift cards instantly after purchase</p>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold mb-1">Secure Trading</h3>
            <p className="text-xs text-muted-foreground">100% secure transactions with buyer protection</p>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold mb-1">Best Prices</h3>
            <p className="text-xs text-muted-foreground">Competitive rates and exclusive discounts</p>
          </div>
        </div>
      </div>
    </div>
  );
}