import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Tag } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

export default function Buy() {
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["gift-cards-public"],
    queryFn: async () => {
      const response = await fetch("/api/gift-cards");
      if (!response.ok) {
        throw new Error("Failed to fetch gift cards");
      }
      return response.json();
    },
  });
  
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const handleBuyClick = () => {
    toast({ title: "Coming Soon", description: "Purchasing gift cards will be available in the next update!" });
  };

  const filteredCards = cards?.filter(c => c.isActive && c.name && c.name.toLowerCase().includes(search.toLowerCase())) || [];
  
  const sortedCards = [...(filteredCards || [])].sort((a, b) => {
    return b.id - a.id;
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Buy Gift Cards</h1>
          <p className="text-muted-foreground mt-2">Get your favorite brand cards at a discount.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No gift cards found matching your search.
          </div>
        ) : (
          <>
            {sortedCards.map((card) => (
              card && card.name && (
                <div key={card.id} className="group hover-lift flex flex-col">
                  {/* Card with enhanced background */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300">
                    {/* Gradient background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                    <div className="absolute inset-0 bg-card/90 backdrop-blur-[2px]" />
                    
                    {/* Card border with gradient */}
                    <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-border via-border/50 to-border">
                      <div className="absolute inset-0 rounded-2xl bg-card" />
                    </div>
                    
                    {/* Main content */}
                    <div className="relative">
                      {/* Image section */}
                      <div className="relative h-40 bg-gradient-to-br from-secondary/80 to-secondary/40 overflow-hidden">
                        <img 
                          src={card.imageUrl || ''} 
                          alt={card.name || ''} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        {/* Image overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                        
                        {parseFloat(card.discount) > 0 && (
                          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-bold flex items-center shadow-lg">
                            <Tag size={12} className="mr-1" />
                            {card.discount}% OFF
                          </div>
                        )}
                      </div>
                      
                      {/* Content section with glass effect */}
                      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-card to-card/95">
                        <h3 className="font-display font-bold text-lg text-foreground truncate">{card.name || 'Unknown Card'}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{card.description || 'No description available'}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="font-bold text-xl text-primary">${card.price}</div>
                          <button 
                            onClick={handleBuyClick}
                            className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors relative overflow-hidden"
                          >
                            <span className="relative z-10">Buy Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
}