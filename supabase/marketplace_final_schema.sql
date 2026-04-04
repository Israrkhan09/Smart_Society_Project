-- ==========================================
-- MARKETPLACE MODULE SCHEMA (SUPABASE)
-- ==========================================
-- Copy and run this in your Supabase SQL Editor.
-- This schema handles listings and their associated images with relationships to users and societies.

-- 1. ENABLE UUID EXTENSION
-- ------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE LISTINGS TABLE
-- ------------------------------------------
-- Main table for all marketplace items.
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price > 0),
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold')),
    user_id TEXT NOT NULL,
    society_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Relationships: ensure valid users and societies
    -- Note: We use REFERENCES for integrity with cascade deletes.
    CONSTRAINT fk_listings_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_listings_society FOREIGN KEY (society_id) REFERENCES public.societies(id) ON DELETE CASCADE
);

-- 3. CREATE LISTING_IMAGES TABLE
-- ------------------------------------------
-- Relational table to support multiple images per listing.
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    url TEXT NOT NULL,
    
    -- Relationships
    CONSTRAINT fk_images_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE
);

-- 4. CREATE MARKETPLACE_MESSAGES TABLE
-- ------------------------------------------
-- Table for communication between users regarding listings.
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_phone TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Relationships
    CONSTRAINT fk_messages_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE
);

-- 5. PERFORMANCE OPTIMIZATION (INDEXES)
-- ------------------------------------------
-- Create indexes to speed up common queries (filtering by user, society, or category).
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_society_id ON public.listings(society_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------
-- For production, you should enable RLS and add policies.
-- Example policy: "Anyone can read active listings"
-- ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 6. STORAGE BUCKET (Manual Step)
-- ------------------------------------------
-- Ensure you create a public bucket named 'listings' in Supabase Storage
-- to store the actual image files before saving the URLs in listing_images.
