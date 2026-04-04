"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Search, Plus, Tag, Clock, MessageCircle, Info,
  Heart, X, ChevronRight, Filter, BookOpen, Phone, Star,
  CheckCircle2, AlertTriangle, Send, Package, Home, Wrench, Zap, Car,
  Upload, ImagePlus
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

      setItems(formatted);
    } catch (err: any) {
      console.error("Error fetching listings:", err);
      setErrorToast("Failed to load listings. Please check connection.");
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

    try {
      setIsSubmitting(true);
      setErrorToast(null);
      let publicUrl = "";

      if (listImage) {
        const fileExt = "jpg";
        const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const base64Data = listImage.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, blob);

        if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`);

        const { data: { publicUrl: url } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);
        
        publicUrl = url;
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
          ...(userData?.societyId && userData.societyId.length > 30 ? { society_id: userData.societyId } : {})
        }])
        .select()
        .single();

      if (lError) throw lError;

      if (publicUrl) {
        await supabase
          .from('listing_images')
          .insert([{ listing_id: listing.id, url: publicUrl }]);
      }

      setShowListModal(false);
      setListForm({ title: "", price: "", category: "Electronics", condition: "Used - Good", description: "" });
      setListImage(null);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
      fetchListings(); 
    } catch (err: any) {
      console.error("Publish Error:", err);
      setErrorToast(err.message || "Failed to publish listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!contactMsg.trim() || !showContactModal || !user) return;
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('marketplace_messages')
        .insert([{
          listing_id: showContactModal.id,
          sender_id: user.uid,
          sender_name: user.displayName || userData?.name || "Resident",
          sender_phone: contactPhone,
          receiver_id: showContactModal.user_id,
          message: contactMsg
        }]);

      if (error) {
        alert("DB Error: " + error.message);
        throw error;
      }

      setContactSent(true);
      setTimeout(() => { 
        setContactSent(false); 
        setContactMsg(""); 
        setShowContactModal(null); 
      }, 2500);
    } catch (err: any) {
      console.error("Messaging Error:", err);
      setErrorToast("Failed to send invitation. Please try again.");
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

  const filtered = items.filter(item => {
    if (selectedCategory === "Wishlist") {
      return wishlist.includes(item.id);
    }
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-8 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Banner */}
      <div className="relative rounded-[3rem] overflow-hidden bg-emerald-950 p-10 lg:p-14 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-xl backdrop-blur-md border border-white/10">
              <ShoppingBag className="text-amber-400" size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Society Exclusives</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Resident Marketplace</h1>
          <p className="text-emerald-50/60 font-medium text-lg leading-relaxed mb-8">
            Buy, sell, or trade within your community. Verified residents only. Safe, secure, local.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setShowListModal(true)} className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/30 flex items-center gap-3">
              <Plus size={18} /> List an Item
            </button>
            <button onClick={() => setShowGuidelines(true)} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3">
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                selectedCategory === label
                  ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                  : "bg-white text-gray-400 border-gray-100 hover:border-amber-200"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 px-2">
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
            <motion.div
              layout key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 transition-all group flex flex-col h-full"
              onClick={() => setShowDetailModal(item)}
            >
              {/* Product Image Section - Full Cover */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* Wishlist Heart */}
                <button
                  onClick={e => { e.stopPropagation(); toggleWishlist(item.id); }}
                  className={`absolute top-5 right-5 w-11 h-11 backdrop-blur-xl rounded-full flex items-center justify-center transition-all shadow-lg border border-white/20 ${
                    wishlist.includes(item.id) 
                      ? "bg-rose-500 text-white border-rose-400" 
                      : "bg-white/40 text-white hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <Heart size={20} fill={wishlist.includes(item.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Product Info Section - Professional Black Theme */}
              <div className="p-7 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="text-xl font-black text-gray-900 line-clamp-1 mb-1 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">
                      {item.category}
                    </span>
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mx-1" />
                    <span className="text-[11px] font-black text-gray-900 truncate max-w-[120px] leading-none">
                       {item.seller}
                    </span>
                  </div>
                </div>

                {/* Price & Action Row - Monochromatic Polish */}
                <div className="flex justify-between items-center mt-auto gap-4 border-t border-gray-50 pt-4">
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-[11px] font-black text-gray-900 font-sans leading-none uppercase">Rs</span>
                    <span className="text-[28px] font-black text-gray-900 tracking-tighter font-sans leading-none">
                      {item.price.replace(/[₨Rs ]/g, "").toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={e => { e.stopPropagation(); setShowContactModal(item); }}
                    className="flex-1 bg-emerald-950 hover:bg-amber-500 text-white py-5 rounded-[1.75rem] font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group/btn min-h-[56px]"
                  >
                    <MessageCircle size={18} /> CONTACT
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">No listings found</p>
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {/* Guidelines Modal */}
        {showGuidelines && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6" onClick={() => setShowGuidelines(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
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
              <button onClick={() => setShowGuidelines(false)} className="mt-10 w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Got it</button>
            </motion.div>
          </motion.div>
        )}

        {/* List Item Modal */}
        {showListModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6" onClick={() => setShowListModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black text-gray-900 leading-tight">List an Item</h2>
                <button onClick={() => setShowListModal(false)} className="p-2 bg-gray-50 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImagePick(f); }} />
                <div onClick={() => fileInputRef.current?.click()} className={`aspect-[16/10] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${listImage ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-amber-400 hover:bg-amber-50"}`}>
                  {listImage ? (
                    <img src={listImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus size={32} className="text-gray-300 mb-2" />
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Add Product Photo</span>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Title" value={listForm.title} onChange={e => setListForm({...listForm, title: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="relative">
                    <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Price (₨)" value={listForm.price} onChange={e => setListForm({...listForm, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={listForm.category} onChange={e => setListForm({...listForm, category: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none ring-offset-0 focus:ring-2 focus:ring-amber-500 cursor-pointer">
                      {CATEGORIES.filter(c => c.label !== "All").map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                    </select>
                    <select value={listForm.condition} onChange={e => setListForm({...listForm, condition: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer">
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Used - Good">Used - Good</option>
                    </select>
                  </div>
                  <textarea placeholder="Description" rows={3} value={listForm.description} onChange={e => setListForm({...listForm, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>

                <button onClick={handleListItem} disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/30 active:scale-95 disabled:opacity-50">
                  {isSubmitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Contact Modal Upgrade */}
        {showContactModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-6" onClick={() => setShowContactModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white rounded-[3.5rem] p-10 max-w-md w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative border border-gray-100" onClick={e => e.stopPropagation()}>
              {contactSent ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 className="text-emerald-500" size={40} /></div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Invitation Sent!</h3>
                  <p className="text-gray-400 font-medium text-sm">Owner will respond shortly.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 leading-none">Contact</h2>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-3 bg-amber-50 px-3 py-1 rounded-full inline-block">Direct Seller Invitation</p>
                    </div>
                    <button onClick={() => setShowContactModal(null)} className="w-12 h-12 bg-gray-50 rounded-[1rem] flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-gray-50/50 rounded-[2rem] p-5 mb-6 border border-gray-100/50 shadow-inner">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center font-black text-amber-600 text-xl shadow-xl border border-gray-100">
                          {showContactModal.seller.charAt(0)}
                        </div>
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-lg text-gray-900 leading-none">{showContactModal.seller}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-[12px] font-black text-gray-600">{showContactModal.seller_rating || "4.8"}</span>
                            <span className="text-gray-300 mx-1">|</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Resident</span>
                         </div>
                       </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-inner shrink-0">
                        <img src={showContactModal.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black text-gray-900 mb-0.5 leading-tight truncate">{showContactModal.title}</p>
                        <p className="text-base font-black text-amber-500 tracking-tight font-sans">
                           <span className="text-[10px] mr-0.5">Rs</span> 
                           {showContactModal.price.replace(/[₨Rs ]/g, "")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="relative group">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-6">WhatsApp Number</label>
                      <input 
                        type="tel"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="e.g. +92 300 1234567"
                        className="w-full bg-gray-50/80 border-2 border-transparent focus:border-amber-500/20 focus:bg-white rounded-[1.5rem] px-6 py-3.5 text-sm font-semibold outline-none transition-all shadow-inner"
                      />
                    </div>
                    
                    <div className="relative group">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-6">Message Invitation</label>
                      <textarea 
                        value={contactMsg} 
                        onChange={e => setContactMsg(e.target.value)} 
                        placeholder={`I'm interested in "${showContactModal.title}"...`} 
                        className="w-full h-20 bg-gray-50/80 border-2 border-transparent focus:border-amber-500/20 focus:bg-white rounded-[1.5rem] px-6 py-4 text-sm font-semibold outline-none transition-all resize-none shadow-inner" 
                      />
                    </div>
                  </div>
                  
                  <button onClick={handleSendMessage} className="w-full bg-gradient-to-br from-gray-900 to-black hover:from-amber-500 hover:to-amber-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-3 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] active:scale-95 transition-all">
                    <Send size={18} /> Send Invitation
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Detail Modal */}
        {showDetailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6" onClick={() => setShowDetailModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3.5rem] max-w-lg w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="aspect-[16/10] bg-gray-50 relative">
                <img src={showDetailModal.image} alt={showDetailModal.title} className="w-full h-full object-cover" />
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
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[2000] border border-emerald-800">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span className="font-bold text-sm tracking-wide">Listing Published Successfully!</span>
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
    </div>
  );
}
