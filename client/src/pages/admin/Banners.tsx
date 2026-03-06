import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image, Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, 
  Sparkles, Layout, Link2, Calendar, AlertCircle, CheckCircle,
  XCircle, Upload, Palette, Layers, Megaphone, Gift, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  link?: string;
  type: "announcement" | "promotion" | "banner";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannerFormData {
  title: string;
  imageUrl: string;
  link: string;
  type: "announcement" | "promotion" | "banner";
  isActive: boolean;
}

export default function Banners() {
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    imageUrl: "",
    link: "",
    type: "banner",
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const response = await fetch("/api/admin/banners", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }
      return response.json();
    },
  });

  const addBannerMutation = useMutation({
    mutationFn: async (newBanner: BannerFormData) => {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(newBanner),
      });
      if (!response.ok) throw new Error("Failed to add banner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsAddingBanner(false);
      resetForm();
      toast({ 
        title: "Success!", 
        description: "Banner has been added successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add banner. Please try again.", 
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, ...banner }: Banner) => {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(banner),
      });
      if (!response.ok) throw new Error("Failed to update banner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setEditingBanner(null);
      resetForm();
      toast({ 
        title: "Success!", 
        description: "Banner has been updated successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update banner. Please try again.", 
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete banner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ 
        title: "Success!", 
        description: "Banner has been deleted successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete banner. Please try again.", 
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, ...formData });
    } else {
      addBannerMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      link: "",
      type: "banner",
      isActive: true,
    });
    setImagePreview(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      link: banner.link || "",
      type: banner.type,
      isActive: banner.isActive,
    });
    setImagePreview(banner.imageUrl);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this banner? This action cannot be undone.")) {
      deleteBannerMutation.mutate(id);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
  };

  // Filter banners based on selected filter
  const filteredBanners = banners.filter((banner: Banner) => {
    if (filter === "active") return banner.isActive;
    if (filter === "inactive") return !banner.isActive;
    return true;
  });

  // Calculate stats
  const totalBanners = banners.length;
  const activeBanners = banners.filter((b: Banner) => b.isActive).length;
  const inactiveBanners = totalBanners - activeBanners;
  const bannerTypes = {
    banner: banners.filter((b: Banner) => b.type === "banner").length,
    announcement: banners.filter((b: Banner) => b.type === "announcement").length,
    promotion: banners.filter((b: Banner) => b.type === "promotion").length,
  };

  // Get icon for banner type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case "announcement": return <Megaphone className="w-4 h-4" />;
      case "promotion": return <Gift className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  // Get color for banner type
  const getTypeColor = (type: string) => {
    switch(type) {
      case "announcement": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "promotion": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default: return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl sm:rounded-2xl">
                <Layout className="w-5 h-5 sm:w-6 sm:w-8 text-primary" />
              </div>
              <span>Banner Management</span>
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base sm:text-lg">
              Create and manage promotional banners for your homepage
            </p>
          </div>
          <button
            onClick={() => {
              setIsAddingBanner(true);
              setEditingBanner(null);
              resetForm();
            }}
            className="group relative inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 overflow-hidden text-sm sm:text-base"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create New Banner</span>
            <span className="sm:hidden">Create</span>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
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
            {tab === "all" && <Layers className="w-3 h-3 sm:w-4 sm:h-4" />}
            {tab === "active" && <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
            {tab === "inactive" && <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {(isAddingBanner || editingBanner) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {editingBanner ? (
                    <>
                      <Edit2 className="w-5 h-5 text-primary" />
                      Edit Banner
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-primary" />
                      Create New Banner
                    </>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingBanner 
                    ? "Update the banner details below" 
                    : "Fill in the information below to create a new banner"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingBanner(false);
                  setEditingBanner(null);
                  resetForm();
                }}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg sm:rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm sm:text-base"
                    placeholder="e.g., Summer Sale 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Banner Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg sm:rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm sm:text-base"
                  >
                    <option value="banner">Standard Banner</option>
                    <option value="announcement">Announcement</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg sm:rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm sm:text-base"
                  placeholder="https://example.com/banner-image.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Destination Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-lg sm:rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm sm:text-base"
                  placeholder="https://example.com/destination"
                />
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  {formData.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="text-xs sm:text-sm">Active - Banner will be visible on the homepage</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      <span className="text-xs sm:text-sm">Inactive - Banner will be hidden from the homepage</span>
                    </>
                  )}
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    <Upload className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary" />
                    Preview
                  </label>
                  <div className="relative w-full h-40 sm:h-56 bg-secondary rounded-lg sm:rounded-xl overflow-hidden border-2 border-primary/20 group">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImagePreview(null);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-medium">Banner Preview</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3 pt-4 flex-col sm:flex-row">
                <button
                  type="submit"
                  disabled={addBannerMutation.isPending || updateBannerMutation.isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 text-sm sm:text-base w-full sm:w-auto"
                >
                  {addBannerMutation.isPending || updateBannerMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                      <span>{editingBanner ? "Updating..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{editingBanner ? "Update Banner" : "Create Banner"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBanner(false);
                    setEditingBanner(null);
                    resetForm();
                  }}
                  className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-border rounded-lg sm:rounded-xl hover:bg-muted transition-all text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banners Grid */}
      {filteredBanners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBanners.map((banner: Banner, index: number) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-card to-card/50 border-2 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Banner Image */}
              <div className="relative h-40 sm:h-56 bg-secondary overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x400?text=Invalid+Image+URL";
                  }}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                      title="Edit banner"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                      title="Delete banner"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-lg ${
                  banner.isActive 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-red-500/90 text-white'
                }`}>
                  {banner.isActive ? (
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

                {/* Type Badge */}
                <div className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-lg ${getTypeColor(banner.type)}`}>
                  {getTypeIcon(banner.type)}
                  <span className="hidden sm:inline capitalize">{banner.type}</span>
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-3 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {banner.title}
                </h3>
                
                {banner.link && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 sm:gap-1.5 text-xs text-primary hover:underline mb-3 sm:mb-4 bg-primary/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                  >
                    <Link2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">{banner.link}</span>
                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </a>
                )}

                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">
                      {new Date(banner.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="sm:inline">
                      {new Date(banner.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded-lg">
                    ID: #{banner.id}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-20 bg-gradient-to-br from-card to-card/50 rounded-2xl sm:rounded-3xl border-2 border-dashed"
        >
          <div className="relative inline-block">
            <Image className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-muted-foreground/30 mb-4" />
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary absolute -top-2 sm:-top-2 -right-2 sm:-right-2 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No Banners Found</h3>
          <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
            {filter !== "all" 
              ? `No ${filter} banners available. Try changing the filter or create a new banner.`
              : "Get started by creating your first banner to promote your content."}
          </p>
          <button
            onClick={() => {
              setIsAddingBanner(true);
              setEditingBanner(null);
              resetForm();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create Your First Banner</span>
            <span className="sm:hidden">Create Banner</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}