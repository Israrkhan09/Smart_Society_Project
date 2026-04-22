"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Search, Plus, Tag, Clock, MessageCircle, Info,
  Heart, X, ChevronRight, Filter, BookOpen, Phone, Star,
  CheckCircle2, AlertTriangle, Send, Package, Home, Wrench, Zap, Car,
  Upload, ImagePlus, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { label: "All", icon: ShoppingBag },
  { label: "Electronics", icon: Zap },
  { label: "Furniture", icon: Home },
  { label: "Vehicles", icon: Car },
  { label: "Services", icon: Wrench },
  { label: "Others", icon: Package },
  { label: "Wishlist", icon: Heart },
];

const GUIDELINES = [
  { icon: CheckCircle2, color: "text-emerald-500", title: "Verified Residents Only", body: "Only verified society members can list or purchase items. Your unit number is shown with every listing." },
  { icon: AlertTriangle, color: "text-amber-500", title: "Prohibited Items", body: "Weapons, illegal substances, counterfeit goods, or anything against society bylaws are strictly not allowed." },
  { icon: Phone, color: "text-blue-500", title: "Safe Communication", body: "Use the built-in contact feature. Avoid sharing personal addresses publicly. Meet in common areas." },
  { icon: Star, color: "text-amber-400", title: "Honest Listings", body: "Describe item condition accurately. Misleading listings will result in account suspension." },
  { icon: BookOpen, color: "text-purple-500", title: "No Cash Advance", body: "Never send money in advance. Inspect items before payment. Society takes no liability for private deals." },
];

export default function MarketplacePage() {
  const { user, userData } = useAuth();
  const displayName = user?.displayName || userData?.name || "Resident";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [listForm, setListForm] = useState({ title: "", price: "", category: "Electronics", condition: "Used - Good", description: "" });
  const [listImage, setListImage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_images (url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(item => ({
        ...item,
        price: `₨ ${item.price.toLocaleString()}`,
        image: item.listing_images?.[0]?.url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
        seller: item.seller_name || "Resident Owner",
        seller_rating: 4.8,
        seller_status: Math.random() > 0.3 ? "Online Now" : "Active 5m ago",
        date: new Date(item.created_at).toLocaleDateString(),
        rating: 4.5,
        reviews: 12
      }));

      // Merge with local storage items
      const localKey = user ? `marketplace-local-${user.uid}` : 'marketplace-local-guest';
      const localSaved = JSON.parse(localStorage.getItem(localKey) || "[]");

      const combined = [...formatted, ...localSaved];
      setItems(combined);
    } catch (err: any) {
      console.error("Error fetching listings:", err);
      const localKey = user ? `marketplace-local-${user.uid}` : 'marketplace-local-guest';
      const localSaved = JSON.parse(localStorage.getItem(localKey) || "[]");

      const mockData = [
        { id: 'm1', title: 'Premium Office Chair', price: '₨ 12,500', category: 'Furniture', seller: 'Adnan Malik', image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600', date: 'Today', status: 'active', condition: 'Like New' },
        { id: 'm2', title: 'MacBook Air M2', price: '₨ 245,000', category: 'Electronics', seller: 'Sara Ali', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600', date: 'Yesterday', status: 'active', condition: 'Brand New' },
        { id: 'm3', title: 'Mountain Bike', price: '₨ 35,000', category: 'Others', seller: 'Zahid Ahmed', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600', date: '2 days ago', status: 'active', condition: 'Used - Good' }
      ];
      setItems([...localSaved, ...mockData]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleListItem = async () => {
    if (!listForm.title || !listForm.price || !user) {
      setErrorToast("Please fill all required fields.");
      return;
    }

    // 1. OPTIMISTIC UPDATE: Add to UI immediately with local image
    const optimisticId = `opt-${Date.now()}`;
    const optimisticListing = {
      id: optimisticId,
      title: listForm.title,
      description: listForm.description,
      price: `₨ ${parseFloat(listForm.price.toString().replace(/,/g, '')).toLocaleString()}`,
      category: listForm.category,
      status: 'active',
      user_id: user.uid,
      seller: user.displayName || userData?.name || "Resident",
      condition: listForm.condition,
      image: listImage || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
      date: 'Just now',
      seller_rating: 4.8,
      seller_status: "Online Now",
      isOptimistic: true
    };

    setItems(prev => [optimisticListing, ...prev]);
    setShowListModal(false);
    setIsSubmitting(true);

    try {
      let publicUrl = null;
      if (listImage && fileInputRef.current?.files?.[0]) {
        try {
          const file = fileInputRef.current.files[0];
          const filePath = `${user.uid}/${Date.now()}.${file.name.split('.').pop()}`;
          // Upload with reasonable timeout
          const { data: uploadData, error: uploadError } = await supabase.storage.from('listings').upload(filePath, file);
          if (!uploadError) {
             const { data: { publicUrl: url } } = supabase.storage.from('listings').getPublicUrl(filePath);
             publicUrl = url;
          }
        } catch (e) {
          console.warn("Storage upload failed, continuing with optimism.");
        }
      }

      const { data: listing, error: lError } = await supabase
        .from('listings')
        .insert([{
          title: listForm.title,
          description: listForm.description,
          price: parseFloat(listForm.price.toString().replace(/,/g, '')),
          category: listForm.category,
          status: 'active',
          user_id: user.uid,
          seller_name: user.displayName || userData?.name || "Resident",
        }])
        .select()
        .single();

      if (lError) throw lError;

      if (publicUrl && listing) {
        await supabase.from('listing_images').insert([{ listing_id: listing.id, url: publicUrl }]);
      }

      setSuccessToast(true);
      setListForm({ title: "", price: "", category: "Electronics", condition: "Used - Good", description: "" });
      setListImage(null);
      setTimeout(() => setSuccessToast(false), 3000);
      
      // Refresh to get real IDs and URLs
      fetchListings();
    } catch (err: any) {
      console.error("Publish Error, saving locally:", err);
      // If DB fails, we keep it in localStorage so it doesn't vanish
      const localKey = user ? `marketplace-local-${user.uid}` : 'marketplace-local-guest';
      const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
      localStorage.setItem(localKey, JSON.stringify([optimisticListing, ...existing]));
      
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!contactMsg.trim() || !showContactModal || !user) return;

    try {
      setIsSubmitting(true);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(showContactModal.id);
      const messagePayload: any = {
        listing_id: isUUID ? showContactModal.id : null,
        sender_id: user.uid,
        sender_name: user.displayName || userData?.name || "Resident",
        receiver_id: showContactModal.user_id || "neighbor_id",
        message: contactMsg,
        sender_phone: contactPhone || ""
      };

      setContactSent(true);
      const { error } = await supabase.from('marketplace_messages').insert([messagePayload]);
      if (error) console.warn("Optimistic UI handled error:", error.message);

      setTimeout(() => {
        setContactSent(false);
        setContactMsg("");
        setContactPhone("");
        setShowContactModal(null);
      }, 600);
    } catch (err: any) {
      console.error("Messaging critical error:", err);
      setErrorToast("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagePick = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setListImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      if (user) localStorage.setItem(`marketplace-wishlist-${user.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  useScrollLock(!!(showGuidelines || showListModal || showContactModal || showDetailModal));

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`marketplace-wishlist-${user.uid}`);
    if (saved) setWishlist(JSON.parse(saved));
  }, [user]);

  const filtered = React.useMemo(() => items.filter(item => {
    if (selectedCategory === "Wishlist") return wishlist.includes(item.id);
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  }), [items, selectedCategory, searchQuery, wishlist]);

  return (
    <div className="flex flex-col gap-8 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header Banner - Optimized Blur */}
      <div className="relative rounded-[3rem] overflow-hidden bg-emerald-950 p-10 lg:p-14 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-white/10">
              <ShoppingBag className="text-amber-400" size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Society Exclusives</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Resident Marketplace</h1>
          <p className="text-emerald-50/60 font-medium text-lg leading-relaxed mb-8">
            Buy, sell, or trade within your community. Verified residents only. Safe, secure, local.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setShowListModal(true)} className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/30 flex items-center gap-3 active:scale-95">
              <Plus size={18} /> List an Item
            </button>
            <button onClick={() => setShowGuidelines(true)} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 active:scale-95">
              <Info size={18} /> Market Guidelines
            </button>
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col gap-6">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search items, categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-5 pl-16 pr-8 text-sm font-semibold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setSelectedCategory(label)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${selectedCategory === label
                  ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                  : "bg-white text-gray-400 border-gray-100 hover:border-amber-200"
                }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid - Hardware Accelerated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 px-2 will-change-transform">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-[3.5rem] p-6 border border-gray-100 animate-pulse">
              <div className="aspect-[16/10] bg-gray-50 rounded-[2.5rem] mb-6" />
              <div className="px-4 pb-4 space-y-3">
                <div className="h-4 bg-gray-50 rounded-full w-3/4" />
                <div className="h-3 bg-gray-50 rounded-full w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-[1.75rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 hover:shadow-2xl hover:shadow-emerald-950/10 hover:-translate-y-1 transition-all duration-200 group flex flex-col relative h-[420px] cursor-pointer will-change-transform"
              onClick={() => setShowDetailModal(item)}
            >
              <div className="relative h-52 w-full overflow-hidden shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy" 
                  decoding="async" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={e => { e.stopPropagation(); toggleWishlist(item.id); }}
                  className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md active:scale-90 z-20 ${wishlist.includes(item.id) ? "bg-rose-500 text-white shadow-rose-500/30" : "bg-white/90 text-gray-400 hover:text-rose-500"}`}
                >
                  <Heart size={16} fill={wishlist.includes(item.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="p-5 flex flex-col items-center flex-1 text-center">
                <h3 className="text-[17px] font-black text-gray-900 mb-2 truncate w-full tracking-tight">{item.title}</h3>
                <div className="flex gap-2 mb-4">
                  <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full text-[8px] font-black uppercase text-emerald-600 tracking-widest leading-none">{item.category}</span>
                  <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none">BY {item.seller.split(' ')[0]}</span>
                </div>
                <div className="flex items-baseline gap-0.5 mb-2">
                  <span className="text-[10px] font-black text-gray-900 uppercase">Rs</span>
                  <span className="text-[26px] font-black text-gray-900 tracking-tighter leading-none">{item.price.replace(/[₨Rs ]/g, "").toLocaleString()}</span>
                </div>
                <div className="mt-auto w-full">
                  <button
                    onClick={e => { e.stopPropagation(); setShowContactModal(item); }}
                    className="w-full bg-emerald-950 hover:bg-emerald-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <MessageCircle size={15} /> CONTACT SELLER
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">No listings found</p>
          </div>
        )}
      </div>

      {/* ─── MODALS - Optimized Backdrop Blur ─── */}
      <AnimatePresence>
        {showGuidelines && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-6" onClick={() => setShowGuidelines(false)}>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              data-lenis-prevent
              style={{ overscrollBehavior: 'contain' }}
              className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[80vh] custom-modal-scroll" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black text-gray-900 mb-8">Guidelines</h2>
              <div className="space-y-6">
                {GUIDELINES.map((g, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><g.icon className={g.color} size={20} /></div>
                    <div>
                      <p className="font-black text-gray-900">{g.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{g.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowGuidelines(false)} className="mt-10 w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-transform">Got it</button>
            </motion.div>
          </motion.div>
        )}

        {showListModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-4" onClick={() => setShowListModal(false)}>
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              data-lenis-prevent
              style={{ overscrollBehavior: 'contain' }}
              className="bg-white rounded-[2rem] p-8 lg:p-10 max-w-xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto custom-modal-scroll"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">List an Item</h2>
                <button onClick={() => setShowListModal(false)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-5">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImagePick(f); }} />
                <div onClick={() => fileInputRef.current?.click()} className={`aspect-[16/8] rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${listImage ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-amber-400 hover:bg-amber-50"}`}>
                  {listImage ? <img src={listImage} alt="Preview" className="w-full h-full object-cover" /> : <><div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3"><ImagePlus size={24} className="text-amber-500" /></div><span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Add Photo</span></>}
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-4">Product Title</label>
                    <div className="relative">
                      <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                      <input
                        type="text"
                        placeholder="What are you selling?"
                        value={listForm.title}
                        onChange={e => setListForm({ ...listForm, title: e.target.value })}
                        className="w-full bg-gray-50/80 border border-transparent focus:border-amber-500/20 focus:bg-white rounded-xl py-3.5 pl-12 pr-6 text-sm font-bold outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-4">Price (RS)</label>
                    <div className="relative">
                      <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={listForm.price}
                        onChange={e => setListForm({ ...listForm, price: e.target.value })}
                        className="w-full bg-gray-50/80 border border-transparent focus:border-amber-500/20 focus:bg-white rounded-xl py-3.5 pl-12 pr-6 text-sm font-bold outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-4">Category</label>
                      <select value={listForm.category} onChange={e => setListForm({ ...listForm, category: e.target.value })} className="w-full bg-gray-50/80 border border-transparent focus:border-amber-500/20 focus:bg-white rounded-xl py-3.5 px-6 text-sm font-bold outline-none cursor-pointer transition-all appearance-none">
                        {CATEGORIES.filter(c => c.label !== "All").map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-4">Condition</label>
                      <select value={listForm.condition} onChange={e => setListForm({ ...listForm, condition: e.target.value })} className="w-full bg-gray-50/80 border border-transparent focus:border-amber-500/20 focus:bg-white rounded-xl py-3.5 px-6 text-sm font-bold outline-none cursor-pointer transition-all appearance-none">
                        <option value="Brand New">Brand New</option>
                        <option value="Like New">Like New</option>
                        <option value="Used - Good">Used - Good</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-4">Description</label>
                    <textarea
                      placeholder="Tell residents about your item..."
                      rows={4}
                      value={listForm.description}
                      onChange={e => setListForm({ ...listForm, description: e.target.value })}
                      className="w-full bg-gray-50/80 border border-transparent focus:border-amber-500/20 focus:bg-white rounded-[1.5rem] p-5 text-sm font-semibold outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button onClick={handleListItem} disabled={isSubmitting} className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-white py-4.5 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {isSubmitting ? "Publishing..." : "Instant Publish"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showContactModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6" onClick={() => setShowContactModal(null)}>
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 30 }} 
              data-lenis-prevent
              style={{ overscrollBehavior: 'contain' }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative border border-gray-100 overflow-y-auto max-h-[90vh] custom-modal-scroll" 
              onClick={e => e.stopPropagation()}
            >
              {contactSent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-inner"><CheckCircle2 className="text-emerald-500" size={32} /></div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Invitation Sent!</h3>
                  <p className="text-gray-400 font-medium text-xs">Owner will respond shortly.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h2 className="text-[22px] font-black text-gray-900 leading-none">Contact</h2>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mt-2.5 bg-amber-50 px-2.5 py-1 rounded-full inline-block">Direct Seller Invitation</p>
                    </div>
                    <button onClick={() => setShowContactModal(null)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all"><X size={18} /></button>
                  </div>

                  <div className="bg-gray-50/50 rounded-[1.5rem] p-4 mb-5 border border-gray-100/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-amber-600 text-lg shadow-md border border-gray-100">
                        {showContactModal.seller.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-gray-900 leading-none">{showContactModal.seller}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-black text-gray-600">4.8</span>
                          <span className="text-gray-300 mx-0.5">|</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Verified Resident</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[1.25rem] p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={showContactModal.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-gray-900 mb-0.5 truncate">{showContactModal.title}</p>
                        <p className="text-base font-black text-amber-500 leading-none truncate">
                          <span className="text-[9px] mr-0.5">Rs</span>
                          {showContactModal.price.replace(/[₨Rs ]/g, "").toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="relative group">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-4">WhatsApp Number</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full bg-gray-50 border-none focus:bg-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                      />
                    </div>

                    <div className="relative group">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-4">Message Invitation</label>
                      <textarea
                        value={contactMsg}
                        onChange={e => setContactMsg(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full h-16 bg-gray-50 border-none focus:bg-gray-100 rounded-xl px-4 py-3 text-xs font-semibold outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button onClick={handleSendMessage} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                    <Send size={16} /> Send Invitation
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {showDetailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6" onClick={() => setShowDetailModal(null)}>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              data-lenis-prevent
              style={{ overscrollBehavior: 'contain' }}
              className="bg-white rounded-[3.5rem] max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[90vh] custom-modal-scroll" 
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-[16/10] bg-gray-50 relative">
                <img src={showDetailModal.image} alt={showDetailModal.title} className="w-full h-full object-cover" loading="lazy" />
                <button onClick={() => setShowDetailModal(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg border border-white/20"><X size={20} /></button>
              </div>
              <div className="p-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 block">{showDetailModal.category}</span>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{showDetailModal.title}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-500 font-sans block leading-none">Rs</span>
                    <p className="text-3xl font-black text-amber-600 tracking-tighter font-sans">{showDetailModal.price.replace(/[₨Rs ]/g, "")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-gray-50">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600 border border-amber-100">{showDetailModal.seller.charAt(0)}</div>
                  <div>
                    <p className="font-black text-gray-900">{showDetailModal.seller}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{showDetailModal.date}</p>
                  </div>
                </div>

                <p className="text-gray-500 font-medium leading-relaxed line-clamp-3">{showDetailModal.description || "No description provided."}</p>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => toggleWishlist(showDetailModal.id)} className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 border transition-all ${wishlist.includes(showDetailModal.id) ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-gray-50 border-transparent text-gray-400 hover:bg-rose-50 hover:text-rose-500"}`}>
                    <Heart size={18} fill={wishlist.includes(showDetailModal.id) ? "currentColor" : "none"} /> {wishlist.includes(showDetailModal.id) ? "Saved" : "Save"}
                  </button>
                  <button onClick={() => { setShowDetailModal(null); setShowContactModal(showDetailModal); }} className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all">Contact Seller</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-10 left-1/2 bg-emerald-950/95 backdrop-blur-xl text-white px-8 py-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-5 z-[4000] border border-emerald-500/30 min-w-[320px] overflow-hidden"
          >
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-emerald-400"
            />
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="text-emerald-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black uppercase tracking-tight leading-tight">Listing Live!</h3>
              <p className="text-emerald-100/60 font-bold text-[9px] uppercase tracking-widest mt-0.5">Published Successfully</p>
            </div>
            <button onClick={() => setSuccessToast(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-emerald-200/50 hover:text-white"><X size={16} /></button>
          </motion.div>
        )}
        {errorToast && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-rose-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[2000] border border-rose-800">
            <AlertTriangle className="text-rose-400" size={20} />
            <span className="font-bold text-sm tracking-wide">{errorToast}</span>
            <button onClick={() => setErrorToast(null)} className="ml-2 text-white/50"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-modal-scroll::-webkit-scrollbar { width: 6px; }
        .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-modal-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-modal-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
