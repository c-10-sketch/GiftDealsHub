import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Edit2, Trash2, Save, X, Package, Tag, DollarSign, 
  Percent, Image as ImageIcon, Gift, TrendingUp, AlertCircle,
  CheckCircle, XCircle, Eye, EyeOff, Upload, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface GiftCardFormData {
  name: string;
  description: string;
  discount: number;
  price: number;
  imageUrl?: string;
  isActive: boolean;
}

export default function AdminGiftCards() {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [formData, setFormData] = useState<GiftCardFormData>({
    name: "",
    description: "",
    discount: 0,
    price: 0,
    imageUrl: "",
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const queryClient = useQueryClient();

  const { data: giftCards = [], isLoading } = useQuery({
    queryKey: ["admin-giftcards"],
    queryFn: async () => {
      const response = await fetch("/api/admin/gift-cards", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch gift cards");
      }
      return response.json();
    },
  });

  const addCardMutation = useMutation({
    mutationFn: async (newCard: GiftCardFormData) => {
      const response = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(newCard),
      });
      if (!response.ok) throw new Error("Failed to add gift card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-giftcards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-cards-public"] });
      setIsAddingCard(false);
      resetForm();
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, ...card }: GiftCard) => {
      const response = await fetch(`/api/admin/gift-cards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(card),
      });
      if (!response.ok) throw new Error("Failed to update gift card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-giftcards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-cards-public"] });
      setEditingCard(null);
      resetForm();
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/gift-cards/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete gift card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-giftcards"] });
      queryClient.invalidateQueries({ queryKey: ["gift-cards-public"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discount: 0,
      price: 0,
      imageUrl: "",
      isActive: true,
    });
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCard) {
      updateCardMutation.mutate({ ...formData, id: editingCard.id, createdAt: editingCard.createdAt, updatedAt: new Date().toISOString() });
    } else {
      addCardMutation.mutate(formData);
    }
  };

  const handleEdit = (card: GiftCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      description: card.description,
      discount: card.discount,
      price: card.price,
      imageUrl: card.imageUrl || "",
      isActive: card.isActive,
    });
    setImagePreview(card.imageUrl || null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this gift card?")) {
      deleteCardMutation.mutate(id);
    }
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setIsAddingCard(false);
    resetForm();
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  // Filter cards based on selected filter
  const filteredCards = giftCards.filter((card: GiftCard) => {
    if (filter === "active") return card.isActive;
    if (filter === "inactive") return !card.isActive;
    return true;
  });

  // Calculate stats
  const totalCards = giftCards.length;
  const activeCards = giftCards.filter((c: GiftCard) => c.isActive).length;
  const inactiveCards = totalCards - activeCards;
  const totalValue = giftCards.reduce((sum: number, card: GiftCard) => sum + card.price, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Stats */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl sm:rounded-2xl">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span>Gift Cards Management</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your gift card inventory, prices, and availability
            </p>
          </div>
          <button
            onClick={() => setIsAddingCard(true)}
            className="group relative inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 overflow-hidden text-sm sm:text-base"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add New Gift Card</span>
            <span className="sm:hidden">Add Card</span>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Total Cards</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{totalCards}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Active Cards</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{activeCards}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-red-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Inactive Cards</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{inactiveCards}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">Total Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">${totalValue.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        {["all", "active", "inactive"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as typeof filter)}
            className={`px-3 py-2 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm capitalize transition-all duration-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
              filter === tab
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {tab === "all" && <Package className="w-3 h-3 sm:w-4 sm:h-4" />}
            {tab === "active" && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
            {tab === "inactive" && <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {(isAddingCard || editingCard) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-2xl shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {editingCard ? (
                    <>
                      <Edit2 className="w-5 h-5 text-primary" />
                      Edit Gift Card
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-primary" />
                      Add New Gift Card
                    </>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingCard ? "Update the gift card details below" : "Fill in the information below to create a new gift card"}
                </p>
              </div>
              <button
                onClick={cancelEdit}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <Package className="inline w-4 h-4 mr-1 text-primary" />
                    Card Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-sm sm:text-base"
                    placeholder="e.g., Amazon Gift Card"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <DollarSign className="inline w-4 h-4 mr-1 text-primary" />
                    Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-sm sm:text-base"
                    placeholder="100.00"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <Percent className="inline w-4 h-4 mr-1 text-primary" />
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-sm sm:text-base"
                    placeholder="5"
                  />
                </div>

                <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-xl bg-muted/30">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium flex items-center gap-2">
                    {formData.isActive ? (
                      <>
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-xs sm:text-sm">Active (Visible to users)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        <span className="text-xs sm:text-sm">Inactive (Hidden from users)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <Tag className="inline w-4 h-4 mr-1 text-primary" />
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-sm sm:text-base"
                  rows={3}
                  placeholder="Describe what this gift card can be used for..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <ImageIcon className="inline w-4 h-4 mr-1 text-primary" />
                  Card Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-background text-sm sm:text-base"
                  placeholder="https://example.com/image.jpg"
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4 p-3 sm:p-4 border-2 border-dashed rounded-lg sm:rounded-xl">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-primary" />
                      Preview
                    </p>
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Card preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImagePreview(null);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm">Preview</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 pt-4 flex-col sm:flex-row">
                <button
                  type="submit"
                  disabled={addCardMutation.isPending || updateCardMutation.isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 text-sm sm:text-base w-full sm:w-auto"
                >
                  {addCardMutation.isPending || updateCardMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                      <span>{editingCard ? "Updating..." : "Adding..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{editingCard ? "Update Gift Card" : "Add Gift Card"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-border rounded-lg sm:rounded-xl hover:bg-muted transition-all text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCards.map((card: GiftCard, index: number) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative bg-gradient-to-br from-card to-card/50 border-2 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${
                card.isActive 
                  ? 'border-green-500/20 hover:border-green-500/40' 
                  : 'border-red-500/20 hover:border-red-500/40 opacity-75'
              }`}
            >
              {/* Card Image */}
              {card.imageUrl && (
                <div className="relative h-36 sm:h-48 overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                        title="Edit card"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                        title="Delete card"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-lg ${
                    card.isActive 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {card.isActive ? (
                      <>
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Active</span>
                        <span className="sm:hidden">On</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Inactive</span>
                        <span className="sm:hidden">Off</span>
                      </>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {card.discount > 0 && (
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-destructive to-destructive/90 text-white rounded-full text-sm font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg">
                      <Percent className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {card.discount}% OFF
                    </div>
                  )}
                </div>
              )}

              {/* Card Content */}
              <div className="p-3 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {card.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">${card.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Discount</p>
                    <p className="text-sm sm:text-lg font-semibold text-green-600 dark:text-green-400">
                      {card.discount}%
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-muted-foreground mt-3">
                  Added: {new Date(card.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-16 bg-gradient-to-br from-card to-card/50 rounded-2xl sm:rounded-3xl border-2 border-dashed"
        >
          <div className="relative inline-block">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-muted-foreground/30 mb-4" />
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary absolute -top-2 sm:-top-2 -right-2 sm:-right-2 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No Gift Cards Found</h3>
          <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
            {filter !== "all" 
              ? `No ${filter} gift cards available. Try changing the filter or add new cards.`
              : "Start by adding your first gift card to the inventory."}
          </p>
          <button
            onClick={() => setIsAddingCard(true)}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Your First Gift Card</span>
            <span className="sm:hidden">Add Card</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}