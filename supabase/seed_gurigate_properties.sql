-- GuriGate Properties Seed Data
-- Works with current database schema for booking section
-- Seeds 12 properties across Hargeisa, Berbera, Borama + Nairobi for frontend compatibility

-- NOTE: This seed uses placeholder owner IDs. Replace these with actual user IDs from your auth.users table
-- or create users in auth.users first before running this seed.

-- ========================================
-- 1. INSERT PROPERTIES (using current schema)
-- ========================================

-- Hargeisa Properties (4 properties)
INSERT INTO properties (
    id, owner_id, title, description, type, purpose, price, price_unit, bedrooms, bathrooms,
    max_guests, max_adults, max_children, max_infants, amenities, city, address, lat, lng,
    is_featured, is_approved, view_count, price_unit_label, property_category, listing_type,
    approval_status, status, beds, cleaning_fee, service_fee, rating_avg, review_count
) VALUES
-- Featured Hargeisa Penthouse
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
 'Modern Penthouse in Hargeisa',
 'Luxurious penthouse with stunning city views and modern amenities. Perfect for business travelers and couples seeking comfort and style.',
 'apartment', 'short_stay', 120.00, 'per_night', 3, 2, 4, 4, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Workspace", "Elevator", "Balcony"]'::jsonb,
 'Hargeisa', 'Sheikh Nur Street, Penthouse A', 9.5600, 44.0650,
 true, true, 128, 'for 2 nights', 'residential', 'short_stay',
 'approved', 'active', 3, 50.00, 15.00, 5.0, 28),

-- Hargeisa Garden Villa
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
 'Garden Oasis Villa',
 'Beautiful villa with private garden, swimming pool, and spacious living areas. Ideal for families and longer stays.',
 'villa', 'short_stay', 245.00, 'per_night', 5, 3, 10, 10, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Garden", "Gym", "Laundry"]'::jsonb,
 'Hargeisa', 'Garden District Road', 9.5500, 44.0750,
 true, true, 95, 'for 2 nights', 'residential', 'short_stay',
 'approved', 'active', 5, 75.00, 25.00, 4.92, 41),

-- Hargeisa Downtown Apartment
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
 'Downtown Hargeisa Apartment',
 'Modern apartment in the heart of Hargeisa with easy access to markets, restaurants, and business centers.',
 'apartment', 'long_rent', 850.00, 'per_month', 2, 1, 3, 3, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "TV", "Workspace"]'::jsonb,
 'Hargeisa', 'Main Street, Apt 4B', 9.5650, 44.0550,
 false, true, 67, '/month', 'residential', 'long_rent',
 'approved', 'active', 2, 0, 0, 4.85, 19),

-- Hargeisa Budget Studio
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001',
 'Cozy Studio Apartment',
 'Affordable studio perfect for students and young professionals. Clean, comfortable, and centrally located.',
 'apartment', 'long_rent', 450.00, 'per_month', 1, 1, 2, 2, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Workspace"]'::jsonb,
 'Hargeisa', 'Central District', 9.5700, 44.0600,
 false, true, 45, '/month', 'residential', 'long_rent',
 'approved', 'active', 1, 0, 0, 4.75, 12)

ON CONFLICT (id) DO NOTHING;

-- Berbera Properties (3 properties)
INSERT INTO properties (
    id, owner_id, title, description, type, purpose, price, price_unit, bedrooms, bathrooms,
    max_guests, max_adults, max_children, max_infants, amenities, city, address, lat, lng,
    is_featured, is_approved, view_count, price_unit_label, property_category, listing_type,
    approval_status, status, beds, cleaning_fee, service_fee, rating_avg, review_count
) VALUES
-- Berbera Beachfront Studio
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002',
 'Beachfront Studio Berbera',
 'Cozy studio apartment just steps from the beach with ocean views and modern amenities.',
 'apartment', 'short_stay', 95.00, 'per_night', 1, 1, 2, 2, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "TV", "Beach Access"]'::jsonb,
 'Berbera', 'Beach Road, Studio 1', 10.4167, 45.0167,
 true, true, 142, 'for 2 nights', 'residential', 'short_stay',
 'approved', 'active', 1, 40.00, 12.00, 4.78, 33),

-- Berbera Port House
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002',
 'Berbera Port House',
 'Spacious house near the port with traditional Somali architecture and modern comforts.',
 'house', 'sale', 180000.00, 'total', 4, 2, 8, 8, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "Garden", "Laundry"]'::jsonb,
 'Berbera', 'Port Avenue', 10.4267, 45.0267,
 false, true, 88, '', 'residential', 'sale',
 'approved', 'active', 4, 0, 0, 4.91, 15),

-- Berbera Modern Apartment
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002',
 'Modern Berbera Apartment',
 'Contemporary apartment with sea views, perfect for professionals working at the port.',
 'apartment', 'long_rent', 650.00, 'per_month', 2, 1, 4, 4, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "TV", "Workspace", "Balcony"]'::jsonb,
 'Berbera', 'Marine District, Apt 2C', 10.4067, 45.0067,
 false, true, 54, '/month', 'residential', 'long_rent',
 'approved', 'active', 2, 0, 0, 4.82, 21)

ON CONFLICT (id) DO NOTHING;

-- Borama Properties (3 properties)
INSERT INTO properties (
    id, owner_id, title, description, type, purpose, price, price_unit, bedrooms, bathrooms,
    max_guests, max_adults, max_children, max_infants, amenities, city, address, lat, lng,
    is_featured, is_approved, view_count, price_unit_label, property_category, listing_type,
    approval_status, status, beds, cleaning_fee, service_fee, rating_avg, review_count
) VALUES
-- Borama Countryside Villa
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003',
 'Borama Countryside Villa',
 'Elegant villa surrounded by beautiful countryside, perfect for those seeking peace and tranquility.',
 'villa', 'long_rent', 750.00, 'per_month', 4, 3, 8, 8, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "Garden", "Gym", "Security System"]'::jsonb,
 'Borama', 'Countryside Lane', 10.0667, 43.1667,
 true, true, 76, '/month', 'residential', 'long_rent',
 'approved', 'active', 4, 0, 0, 4.88, 22),

-- Borama Modern Apartment
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003',
 'Modern Borama Apartment',
 'Contemporary apartment with all modern amenities in the growing city of Borama.',
 'apartment', 'short_stay', 110.00, 'per_night', 2, 1, 4, 4, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "TV", "Workspace", "Elevator"]'::jsonb,
 'Borama', 'Modern Street, Apt 2C', 10.0767, 43.1767,
 false, true, 54, 'for 2 nights', 'residential', 'short_stay',
 'approved', 'active', 2, 45.00, 14.00, 4.75, 18),

-- Borama Family House
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003',
 'Borama Family House',
 'Spacious family house with large garden, perfect for families with children.',
 'house', 'sale', 145000.00, 'total', 5, 3, 10, 10, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "Garden", "Laundry", "Security System"]'::jsonb,
 'Borama', 'Family District', 10.0567, 43.1567,
 false, true, 45, '', 'residential', 'sale',
 'approved', 'active', 5, 0, 0, 4.86, 17)

ON CONFLICT (id) DO NOTHING;

-- Nairobi Properties (2 properties - limited for frontend compatibility)
INSERT INTO properties (
    id, owner_id, title, description, type, purpose, price, price_unit, bedrooms, bathrooms,
    max_guests, max_adults, max_children, max_infants, amenities, city, address, lat, lng,
    is_featured, is_approved, view_count, price_unit_label, property_category, listing_type,
    approval_status, status, beds, cleaning_fee, service_fee, rating_avg, review_count
) VALUES
-- Nairobi Skyper Apartment
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004',
 'Skyper Pool Apartment',
 'Modern apartment with pool access and city views in upscale Nairobi neighborhood.',
 'apartment', 'sale', 280000.00, 'total', 4, 2, 6, 6, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Gym", "Laundry", "Security System"]'::jsonb,
 'Nairobi', 'Westlands Road, Penthouse B', -1.2921, 36.8219,
 true, true, 203, '', 'residential', 'sale',
 'approved', 'active', 4, 0, 0, 4.87, 45),

-- Nairobi Karen Villa
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004',
 'Karen Garden Villa',
 'Luxurious villa in prestigious Karen area with beautiful gardens and security.',
 'villa', 'short_stay', 320.00, 'per_night', 5, 3, 10, 10, 0, 0,
 '["WiFi", "Air Conditioning", "Kitchen", "Parking", "Garden", "Pool", "Gym", "Security System"]'::jsonb,
 'Nairobi', 'Karen Lane', -1.3121, 36.8419,
 true, true, 187, 'for 2 nights', 'residential', 'short_stay',
 'approved', 'active', 5, 80.00, 30.00, 4.93, 72)

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. DELETE EXISTING PROPERTY IMAGES
-- ========================================
DELETE FROM property_images WHERE listing_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012'
);

-- ========================================
-- 3. INSERT PROPERTY IMAGES
-- ========================================

INSERT INTO property_images (listing_id, url, is_primary, sort_order) VALUES
-- Hargeisa Properties
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', false, 2),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1600210492486-8cc7c9e0c7f1?w=800&q=80', false, 3),

('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', true, 1),

('550e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', true, 1),

-- Berbera Properties
('550e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', true, 1),

('550e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', true, 1),

-- Borama Properties
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1560185008-b033106af5c4?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', true, 1),

('550e8400-e29b-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1560185007-a5c3f9d9d567?w=800&q=80', true, 1),

-- Nairobi Properties
('550e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1560185008-0bf1743c7499?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1560185009-cde436f6a4d0?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1560185008-b033106af5c4?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80', false, 2);
