"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Filter, Plus, MessageSquare, Users, ShieldCheck, 
  Building, AlertTriangle, BellRing, Sparkles, Archive, 
  Settings, Pin, Check, CheckCheck, MoreVertical, Paperclip, 
  Smile, Mic, Send, Phone, Video, Info, Image as ImageIcon, 
  FileText, Megaphone, ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const folders = [
  { id: 'all', name: 'All Chats', icon: MessageSquare, count: 5 },
  { id: 'residents', name: 'Residents', icon: Users, count: 2 },
  { id: 'guards', name: 'Guards', icon: ShieldCheck, count: 0 },
  { id: 'admin', name: 'Admin Messages', icon: Building, count: 1 },
  { id: 'emergency', name: 'Emergency Alerts', icon: AlertTriangle, count: 0 },
  { id: 'announcements', name: 'Announcements', icon: Megaphone, count: 2 },
  { id: 'ai', name: 'AI Assistant', icon: Sparkles, count: 0 },
  { id: 'archived', name: 'Archived Chats', icon: Archive, count: 0 },
  { id: 'settings', name: 'Settings', icon: Settings, count: 0 },
];

const mockChats = [
  {
    id: 1,
    name: "John Doe",
    role: "Resident",
    avatar: "J",
    lastMessage: "Can you approve my visitor pass?",
    time: "10:42 AM",
    unread: 2,
    online: true,
    typing: false,
    pinned: true,
    priority: false,
    type: "individual",
    category: "residents"
  },
  {
    id: 2,
    name: "Security Gate 1",
    role: "Guard",
    avatar: "S",
    lastMessage: "Delivery for Unit 4B arrived.",
    time: "09:15 AM",
    unread: 0,
    online: true,
    typing: true,
    pinned: false,
    priority: false,
    type: "individual",
    category: "guards"
  },
  {
    id: 3,
    name: "System Admin",
    role: "Admin",
    avatar: "A",
    lastMessage: "Maintenance scheduled for tomorrow.",
    time: "Yesterday",
    unread: 1,
    online: false,
    typing: false,
    pinned: true,
    priority: true,
    type: "individual",
    category: "admin"
  },
  {
    id: 4,
    name: "General Announcements",
    role: "System",
    avatar: "G",
    lastMessage: "Water supply interruption notice.",
    time: "Tue",
    unread: 2,
    online: false,
    typing: false,
    pinned: false,
    priority: false,
    type: "broadcast",
    category: "announcements"
  },
];

const initialMessages = [
  { id: 1, sender: 'them', text: "Hello! I needed some help with the visitor pass.", time: "10:30 AM", status: "read" },
  { id: 2, sender: 'me', text: "Sure, I can help you with that. What seems to be the issue?", time: "10:32 AM", status: "read" },
  { id: 3, sender: 'them', text: "The app is showing an error when I try to add a vehicle number.", time: "10:35 AM", status: "read" },
  { id: 4, sender: 'me', text: "Let me check the system logs.", time: "10:36 AM", status: "read" },
  { id: 5, sender: 'them', text: "Can you approve my visitor pass manually for now?", time: "10:42 AM", status: "delivered" },
];

export default function MessagesDashboard() {
  const [activeFolder, setActiveFolder] = useState('all');
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { role } = useAuth();

  const activeChatData = mockChats.find(c => c.id === activeChat);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
      }, 10);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "delivered"
    };
    
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* 1. LEFT SIDEBAR - FOLDERS */}
      <div className="w-full md:w-56 border-r border-slate-100 flex flex-col bg-slate-50/50 flex-shrink-0">
        <div className="p-5">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Comms</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 custom-scrollbar">
          {folders.map((folder) => {
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                  isActive 
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <folder.icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className={`text-[11px] font-bold ${isActive ? '' : ''}`}>{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. CENTER PANEL - CHAT LIST */}
      <div className="w-full md:w-[300px] border-r border-slate-100 flex flex-col bg-white flex-shrink-0">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-black text-slate-900">Chats</h3>
            <div className="flex gap-1.5">
              <button className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
                <Filter size={14} />
              </button>
              <button className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-sm">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto custom-scrollbar pb-1">
            {['All', 'Unread', 'Priority', 'Groups'].map((filter, i) => (
              <button key={filter} className={`flex-shrink-0 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                i === 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {mockChats.map((chat) => {
            const isActive = activeChat === chat.id;
            return (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`flex items-start gap-2.5 p-3 border-b border-slate-50 cursor-pointer transition-colors ${
                  isActive ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white shadow-sm ${
                    chat.role === 'Admin' ? 'bg-rose-500' :
                    chat.role === 'Guard' ? 'bg-blue-500' :
                    chat.role === 'System' ? 'bg-purple-500' :
                    'bg-emerald-500'
                  }`}>
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate pr-2">{chat.name}</h4>
                    <span className={`text-[9px] font-bold whitespace-nowrap ${chat.unread > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {chat.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                      {chat.role}
                    </span>
                    {chat.priority && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-1 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle size={8} /> Priority
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {chat.typing ? (
                      <p className="text-[10px] font-semibold text-emerald-500 animate-pulse flex items-center gap-1">
                        Typing...
                      </p>
                    ) : (
                      <p className={`text-[10px] truncate ${chat.unread > 0 ? 'font-semibold text-slate-700' : 'font-medium text-slate-500'}`}>
                        {chat.lastMessage}
                      </p>
                    )}

                    <div className="flex items-center gap-1 flex-shrink-0 pl-1">
                      {chat.pinned && <Pin size={10} className="text-slate-400" />}
                      {chat.unread > 0 && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. RIGHT PANEL - CHAT WINDOW */}
      <div className="flex-1 h-full flex flex-col bg-slate-50 relative min-w-0 overflow-hidden">
        {activeChatData ? (
          <>
            {/* Chat Header */}
            <div className="h-[64px] px-5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm ${
                  activeChatData.role === 'Admin' ? 'bg-rose-500' :
                  activeChatData.role === 'Guard' ? 'bg-blue-500' :
                  activeChatData.role === 'System' ? 'bg-purple-500' :
                  'bg-emerald-500'
                }`}>
                  {activeChatData.avatar}
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    {activeChatData.name}
                    {activeChatData.priority && <AlertTriangle size={12} className="text-rose-500" />}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                    {activeChatData.role} • {activeChatData.online ? <span className="text-emerald-500">Online</span> : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Phone size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Video size={14} />
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <Search size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={messagesEndRef} className="flex-1 h-full min-h-0 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="flex justify-center mb-6">
                <span className="px-2 py-1 bg-slate-200/50 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">Today</span>
              </div>
              
              {messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                      <div className={`px-3 py-2 rounded-xl shadow-sm ${
                        isMe 
                        ? 'bg-slate-900 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                      }`}>
                        <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] font-bold text-slate-400">{msg.time}</span>
                        {isMe && (
                          msg.status === 'read' ? <CheckCheck size={10} className="text-emerald-500" /> : <Check size={10} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {activeChatData.typing && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-100 rounded-tl-sm shadow-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex gap-0.5 pb-1.5">
                  <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <Paperclip size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <ImageIcon size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <Smile size={16} />
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all flex items-end">
                  <textarea 
                    placeholder="Type a message..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full max-h-24 min-h-[38px] bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 custom-scrollbar"
                    rows={1}
                  />
                  <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <Mic size={16} />
                  </button>
                </div>
                
                <button 
                  onClick={handleSend}
                  className="w-10 h-[38px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-5 shadow-inner">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Your Messages</h3>
            <p className="text-xs font-medium text-slate-500 max-w-xs">
              Select a conversation from the list or start a new chat to communicate securely across the platform.
            </p>
            <button className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md shadow-slate-900/20 hover:scale-105 transition-all">
              Start New Conversation
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </div>
  );
}
