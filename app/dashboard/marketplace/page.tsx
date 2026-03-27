"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Search, Plus, Tag, Clock, MessageCircle, Info,
  Heart, X, ChevronRight, Filter, BookOpen, Phone, Star,
  CheckCircle2, AlertTriangle, Send, Package, Home, Wrench, Zap, Car
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";

const CATEGORIES = [
  { label: "All", icon: ShoppingBag },
  { label: "Electronics", icon: Zap },
  { label: "Furniture", icon: Home },
  { label: "Vehicles", icon: Car },
  { label: "Services", icon: Wrench },
  { label: "Others", icon: Package },
];

const INITIAL_ITEMS = [
  {
    id: 1, title: "Sony PlayStation 5", price: "₨ 145,000", category: "Electronics",
    seller: "Zain K.", sellerContact: "0300-1234567", date: "1d ago",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600",
    condition: "Brand New", description: "Sealed box PS5 with two controllers. Never opened. Bought as a gift but already have one.",
    rating: 4.8, reviews: 12
  },
  {
    id: 2, title: "Ergonomic Office Chair", price: "₨ 12,000", category: "Furniture",
    seller: "Sarah M.", sellerContact: "0311-9876543", date: "5h ago",
    image: "https://images.unsplash.com/photo-1505797149-43b007664a3e?auto=format&fit=crop&q=80&w=600",
    condition: "Used - Good", description: "High-quality ergonomic chair, used for 6 months. Lumbar support intact. No scratches.",
    rating: 4.5, reviews: 7
  },
  {
    id: 3, title: "Eco-Friendly Electric Scooter", price: "₨ 85,000", category: "Vehicles",
    seller: "Ahmed R.", sellerContact: "0321-5556677", date: "2h ago",
    image: "https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?auto=format&fit=crop&q=80&w=600",
    condition: "Like New", description: "Top-brand electric scooter with 40km range per charge. Only 200km done. Full kit included.",
    rating: 5.0, reviews: 3
  },
  {
    id: 4, title: "Maths Home Tuition", price: "₨ 5,000/mo", category: "Services",
    seller: "Prof. Usman", sellerContact: "0333-7778899", date: "3d ago",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    condition: "Verified Service", description: "O and A-Level maths tuition. 10 years experience. Available Mon-Sat. Morning/evening slots.",
    rating: 4.9, reviews: 28
  },
  {
    id: 5, title: "Apple MacBook Air M2", price: "₨ 295,000", category: "Electronics",
    seller: "Hina B.", sellerContact: "0345-4443322", date: "12h ago",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600",
    condition: "Like New", description: "M2 Macbook Air 8GB/256GB in Midnight color. Bought 3 months ago, barely used. Comes with box and charger.",
    rating: 4.7, reviews: 9
  },
  {
    id: 6, title: "Solid Wood Dining Table", price: "₨ 35,000", category: "Furniture",
    seller: "Omar F.", sellerContact: "0312-2223344", date: "2d ago",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600",
    condition: "Used - Fair", description: "6-seater sheesham wood dining table. Some minor surface marks but very sturdy. Pickup only.",
    rating: 4.2, reviews: 5
  },
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

  const [items, setItems] = useState<any[]>(INITIAL_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [listForm, setListForm] = useState({ title: "", price: "", category: "Electronics", condition: "Used - Good", description: "" });

  // Lock body scroll when any modal is open
  useScrollLock(!!(showGuidelines || showListModal || showContactModal || showDetailModal));

  // Load wishlist per user
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`marketplace-wishlist-${user.uid}`);
    if (saved) setWishlist(JSON.parse(saved));
  }, [user]);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const updated = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      if (user) localStorage.setItem(`marketplace-wishlist-${user.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleListItem = () => {
    if (!listForm.title || !listForm.price) return;
    const newItem = {
      id: Date.now(),
      ...listForm,
      price: listForm.price.startsWith("₨") ? listForm.price : `₨ ${listForm.price}`,
      seller: displayName.split(" ")[0] + " (You)",
      sellerContact: "Your contact",
      date: "Just now",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
      rating: 0, reviews: 0
    };
    setItems(prev => [newItem, ...prev]);
    setListForm({ title: "", price: "", category: "Electronics", condition: "Used - Good", description: "" });
    setShowListModal(false);
  };

  const handleSendMessage = () => {
    if (!contactMsg.trim()) return;
    setContactSent(true);
    setTimeout(() => { setContactSent(false); setContactMsg(""); setShowContactModal(null); }, 2500);
  };

  const filtered = items.filter(item => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.seller.toLowerCase().includes(q) || item.condition.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header Banner */}
      <div className="relative rounded-[3rem] overflow-hidden bg-emerald-950 p-10 lg:p-14 text-white shadow-2xl shadow-emerald-950/20">
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
            <button
              onClick={() => setShowListModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/30 flex items-center gap-3"
            >
              <Plus size={18} /> List an Item
            </button>
            <button
              onClick={() => setShowGuidelines(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3"
            >
              <Info size={18} /> Market Guidelines
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search items, categories, sellers..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-5 pl-16 pr-8 text-sm font-semibold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 flex-wrap">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setSelectedCategory(label)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
              selectedCategory === label
                ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                : "bg-white text-gray-400 border-gray-100 hover:border-amber-200 hover:text-amber-500"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
        {wishlist.length > 0 && (
          <button
            onClick={() => setSelectedCategory("__WISHLIST__")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
              selectedCategory === "__WISHLIST__"
                ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20"
                : "bg-white text-rose-400 border-rose-100 hover:text-rose-500"
            }`}
          >
            <Heart size={14} /> Wishlist ({wishlist.length})
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center -mt-3">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {selectedCategory === "__WISHLIST__"
            ? `${wishlist.length} Saved Items`
            : `${filtered.length} Listing${filtered.length !== 1 ? "s" : ""} Found`}
        </p>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {(selectedCategory === "__WISHLIST__" ? items.filter(i => wishlist.includes(i.id)) : filtered).map(item => (
            <motion.div
              layout key={item.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setShowDetailModal(item)}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase text-amber-600 shadow">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleWishlist(item.id); }}
                  className={`absolute top-4 right-4 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-lg ${
                    wishlist.includes(item.id) ? "bg-rose-500 text-white" : "bg-white/70 text-rose-400 hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <Heart size={15} fill={wishlist.includes(item.id) ? "currentColor" : "none"} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-black text-gray-900 group-hover:text-amber-600 transition-colors leading-tight pr-4">{item.title}</h3>
                  <p className="text-lg font-black text-amber-600 tracking-tight shrink-0">{item.price}</p>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-4 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center font-black text-[11px] text-amber-600 uppercase">
                      {item.seller.charAt(0)}
                    </div>
                    <span className="text-[11px] font-black text-gray-700">{item.seller}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-gray-500">{item.rating > 0 ? item.rating : "New"}</span>
                  </div>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); setShowContactModal(item); }}
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <MessageCircle size={14} /> Contact Seller
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(selectedCategory === "__WISHLIST__" ? items.filter(i => wishlist.includes(i.id)) : filtered).length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
          <ShoppingBag size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No listings found</p>
          <p className="text-xs text-gray-300 mt-2">Try a different category or search term</p>
        </div>
      )}

      {/* ─── GUIDELINES MODAL ─── */}
      <AnimatePresence>
        {showGuidelines && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGuidelines(false)}
          >
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Market Guidelines</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Community Rules & Safety</p>
                </div>
                <button onClick={() => setShowGuidelines(false)} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {GUIDELINES.map((g, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl">
                    <g.icon size={20} className={`${g.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-black text-sm text-gray-900 mb-1">{g.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{g.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowGuidelines(false)} className="mt-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LIST ITEM MODAL ─── */}
      <AnimatePresence>
        {showListModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowListModal(false)}
          >
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">List an Item</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fill in the details below</p>
                </div>
                <button onClick={() => setShowListModal(false)} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <input value={listForm.title} onChange={e => setListForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Item title *" className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                <input value={listForm.price} onChange={e => setListForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="Price (e.g. 15,000) *" className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={listForm.category} onChange={e => setListForm(p => ({ ...p, category: e.target.value }))}
                    className="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all bg-white">
                    {CATEGORIES.filter(c => c.label !== "All").map(c => <option key={c.label}>{c.label}</option>)}
                  </select>
                  <select value={listForm.condition} onChange={e => setListForm(p => ({ ...p, condition: e.target.value }))}
                    className="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all bg-white">
                    {["Brand New", "Like New", "Used - Good", "Used - Fair", "Verified Service"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <textarea value={listForm.description} onChange={e => setListForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your item (condition, age, what's included...)"
                  rows={4} className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all resize-none" />
                <button onClick={handleListItem}
                  disabled={!listForm.title || !listForm.price}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-500/20">
                  Publish Listing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CONTACT MODAL ─── */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowContactModal(null); setContactMsg(""); setContactSent(false); }}
          >
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {contactSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-gray-400">The seller has been notified. They'll respond shortly.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-7">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Contact Seller</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{showContactModal.title}</p>
                    </div>
                    <button onClick={() => setShowContactModal(null)} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center font-black text-amber-600 text-sm">
                      {showContactModal.seller.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-900">{showContactModal.seller}</p>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{showContactModal.sellerContact}</p>
                    </div>
                  </div>
                  <textarea
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                    placeholder={`Hi, I'm interested in your "${showContactModal.title}" listed for ${showContactModal.price}. Is it still available?`}
                    rows={5}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 transition-all resize-none mb-4"
                  />
                  <button onClick={handleSendMessage}
                    disabled={!contactMsg.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                    <Send size={14} /> Send Message
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(null)}
          >
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-[16/8] overflow-hidden">
                <img src={showDetailModal.image} alt={showDetailModal.title} className="w-full h-full object-cover" />
                <button onClick={() => setShowDetailModal(null)}
                  className="absolute top-5 right-5 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:text-rose-500 transition-all shadow">
                  <X size={18} />
                </button>
                <div className="absolute bottom-5 left-5 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-amber-600 shadow">{showDetailModal.category}</span>
                  <span className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{showDetailModal.condition}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-black text-gray-900">{showDetailModal.title}</h2>
                  <p className="text-2xl font-black text-amber-600 shrink-0">{showDetailModal.price}</p>
                </div>
                {showDetailModal.rating > 0 && (
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.round(showDetailModal.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
                    <span className="text-xs font-black text-gray-400 ml-2">{showDetailModal.rating} · {showDetailModal.reviews} reviews</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{showDetailModal.description}</p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center font-black text-amber-600 text-sm">{showDetailModal.seller.charAt(0)}</div>
                  <div>
                    <p className="font-black text-sm text-gray-900">{showDetailModal.seller}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listed {showDetailModal.date}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => toggleWishlist(showDetailModal.id)}
                    className={`flex-1 border py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      wishlist.includes(showDetailModal.id) ? "bg-rose-50 text-rose-500 border-rose-200" : "border-gray-200 text-gray-400 hover:border-rose-200 hover:text-rose-500"
                    }`}>
                    <Heart size={14} fill={wishlist.includes(showDetailModal.id) ? "currentColor" : "none"} />
                    {wishlist.includes(showDetailModal.id) ? "Saved" : "Save"}
                  </button>
                  <button onClick={() => { setShowDetailModal(null); setShowContactModal(showDetailModal); }}
                    className="flex-[2] bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                    <MessageCircle size={14} /> Contact Seller
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
