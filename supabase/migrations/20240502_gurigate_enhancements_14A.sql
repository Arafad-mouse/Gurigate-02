-- GuriGate Enhancements Migration 14A
-- Enum changes and schema prerequisites that PostgreSQL requires to be committed first
-- This migration prepares the schema for the Homes/Properties backend additions

-- ========================================
-- 1. ENSURE EXISTING ENUMS ARE AVAILABLE
-- ========================================

-- Check if property_purpose enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_purpose') THEN
        CREATE TYPE property_purpose AS ENUM (
            'sale',
            'long_rent', 
            'short_stay'
        );
    END IF;
END $$;

-- Check if property_status enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
        CREATE TYPE property_status AS ENUM (
            'active',
            'inactive',
            'pending',
            'occupied',
            'maintenance'
        );
    END IF;
END $$;

-- Check if property_type enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM (
            'apartment',
            'house',
            'villa',
            'studio',
            'condo',
            'townhouse',
            'cottage',
            'penthouse',
            'loft',
            'other'
        );
    END IF;
END $$;

-- Check if price_unit enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_unit') THEN
        CREATE TYPE price_unit AS ENUM (
            'per_night',
            'per_month',
            'total'
        );
    END IF;
END $$;

-- ========================================
-- 2. ENSURE CORE TABLES EXIST WITH BASIC STRUCTURE
-- ========================================

-- Check if properties table exists, create minimal structure if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'properties') THEN
        CREATE TABLE properties (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            type property_type NOT NULL,
            purpose property_purpose NOT NULL DEFAULT 'short_stay',
            status property_status DEFAULT 'active',
            price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
            price_unit price_unit NOT NULL DEFAULT 'per_night',
            price_unit_label VARCHAR(50) DEFAULT 'for 2 nights',
            bedrooms INTEGER CHECK (bedrooms >= 0),
            bathrooms DECIMAL(3,1) CHECK (bathrooms >= 0),
            max_guests INTEGER CHECK (max_guests >= 1),
            amenities TEXT[] DEFAULT '{}',
            lat DECIMAL(10,8),
            lng DECIMAL(11,8),
            location_id UUID REFERENCES locations(id),
            owner_id UUID REFERENCES auth.users(id),
            is_featured BOOLEAN DEFAULT FALSE,
            is_approved BOOLEAN DEFAULT FALSE,
            view_count INTEGER DEFAULT 0,
            rating_avg DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
            review_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if locations table exists, create minimal structure if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'locations') THEN
        CREATE TABLE locations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            district VARCHAR(100),
            country VARCHAR(100) DEFAULT 'Somalia',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if property_images table exists, create minimal structure if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'property_images') THEN
        CREATE TABLE property_images (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            is_primary BOOLEAN DEFAULT FALSE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if bookings table exists, create minimal structure if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bookings') THEN
        CREATE TABLE bookings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            guest_id UUID REFERENCES auth.users(id),
            check_in_date DATE NOT NULL,
            check_out_date DATE NOT NULL CHECK (check_out_date > check_in_date),
            total_price DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Check if images table exists, create minimal structure if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'images') THEN
        CREATE TABLE images (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            url TEXT NOT NULL,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            is_primary BOOLEAN DEFAULT FALSE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- ========================================
-- 3. CREATE HELPER FUNCTIONS FOR MIGRATION 14B
-- ========================================

-- Function to safely add columns if they don't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name TEXT,
    column_name TEXT,
    column_type TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = table_name AND column_name = column_name
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', table_name, column_name, column_type);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely create indexes
CREATE OR REPLACE FUNCTION create_index_if_not_exists(
    index_name TEXT,
    table_name TEXT,
    index_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = index_name) THEN
        EXECUTE format('CREATE INDEX %I ON %I %s', index_name, table_name, index_definition);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. PREPARE STORAGE BUCKET STRUCTURE
-- ========================================

-- Ensure storage bucket exists (will be finalized in 14B)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'buckets' AND schemaname = 'storage') THEN
        -- storage extension should be enabled, but we'll check
        BEGIN
            INSERT INTO storage.buckets (id, name, public)
            VALUES ('property-images', 'property-images', true)
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN undefined_table THEN
            -- storage extension not available, will be handled in 14B
            NULL;
        END;
    END IF;
END $$;

-- ========================================
-- 5. PREPARE TRIGGER FUNCTIONS
-- ========================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create property rating update function for 14B
CREATE OR REPLACE FUNCTION update_property_rating_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be used in 14B when property_reviews table is created
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 6. BASIC INDEXES FOR EXISTING TABLES
-- ========================================

-- Add basic indexes to properties table
SELECT add_column_if_not_exists('properties', 'is_featured', 'BOOLEAN DEFAULT FALSE');
SELECT add_column_if_not_exists('properties', 'is_approved', 'BOOLEAN DEFAULT FALSE');
SELECT add_column_if_not_exists('properties', 'view_count', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('properties', 'rating_avg', 'DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5)');
SELECT add_column_if_not_exists('properties', 'review_count', 'INTEGER DEFAULT 0');
SELECT add_column_if_not_exists('properties', 'price_unit_label', 'VARCHAR(50) DEFAULT ''for 2 nights''');

-- Create basic indexes
SELECT create_index_if_not_exists('idx_properties_type', 'properties', '(type)');
SELECT create_index_if_not_exists('idx_properties_status', 'properties', '(status)');
SELECT create_index_if_not_exists('idx_properties_featured', 'properties', '(is_featured) WHERE is_featured = TRUE');
SELECT create_index_if_not_exists('idx_properties_approved', 'properties', '(is_approved) WHERE is_approved = TRUE');
SELECT create_index_if_not_exists('idx_properties_price', 'properties', '(price)');

-- ========================================
-- 7. ENSURE RLS IS ENABLED ON CORE TABLES
-- ========================================

-- Enable RLS on properties if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties' AND rowsecurity = true) THEN
        ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on property_images if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_images' AND rowsecurity = true) THEN
        ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ========================================
-- 8. PREPARE FOR MIGRATION 14B
-- ========================================

-- This migration ensures all enum types and basic table structures exist
-- Migration 14B will add:
-- - property_reviews table
-- - wishlists table  
-- - Additional indexes
-- - Complete RLS policies
-- - Storage bucket policies
-- - Views and triggers
-- - Seed data

COMMIT;
