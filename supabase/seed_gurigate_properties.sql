-- GuriGate Properties Seed Data
-- Works with existing schema (locations, property_type, property_purpose, price_unit enums)
-- Seeds 12 properties across Hargeisa, Berbera, Borama + Nairobi for frontend compatibility

-- ========================================
-- 1. INSERT PROPERTIES (using existing schema)
-- ========================================

-- Get location IDs for East African cities
-- Note: These should exist from previous migrations, but we'll reference them by name

-- Hargeisa Properties (4 properties)
INSERT INTO properties (
    id, title, description, type, purpose, status, price, price_unit, bedrooms, bathrooms,
    max_guests, amenities, lat, lng, location_id, owner_id, 
    is_featured, is_approved, rating_avg, review_count, price_unit_label
) VALUES
-- Featured Hargeisa Penthouse
('550e8400-e29b-41d4-a716-446655440001', 
 'Modern Penthouse in Kileleshwa', 
 'Luxurious penthouse with stunning city views and modern amenities. Perfect for business travelers and couples seeking comfort and style.',
 'penthouse', 'short_stay', 'active', 120.00, 'per_night', 3, 2, 4,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Workspace', 'Elevator', 'Balcony'],
 9.5600, 44.0650,
 (SELECT id FROM locations WHERE name = 'Hargeisa' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440001',
 true, true, 5.0, 28, 'for 2 nights'),

-- Hargeisa Garden Villa  
('550e8400-e29b-41d4-a716-446655440002',
 'Garden Oasis Villa',
 'Beautiful villa with private garden, swimming pool, and spacious living areas. Ideal for families and longer stays.',
 'villa', 'short_stay', 'active', 245.00, 'per_night', 5, 3, 10,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Garden', 'Gym', 'Laundry'],
 9.5500, 44.0750,
 (SELECT id FROM locations WHERE name = 'Hargeisa' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440001',
 true, true, 4.92, 41, 'for 2 nights'),

-- Hargeisa Downtown Apartment
('550e8400-e29b-41d4-a716-446655440003',
 'Downtown Hargeisa Apartment',
 'Modern apartment in the heart of Hargeisa with easy access to markets, restaurants, and business centers.',
 'apartment', 'long_rent', 'active', 850.00, 'per_month', 2, 1, 3,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace'],
 9.5650, 44.0550,
 (SELECT id FROM locations WHERE name = 'Hargeisa' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440001',
 false, true, 4.85, 19, '/month'),

-- Hargeisa Budget Studio
('550e8400-e29b-41d4-a716-446655440004',
 'Cozy Studio Apartment',
 'Affordable studio perfect for students and young professionals. Clean, comfortable, and centrally located.',
 'studio', 'long_rent', 'active', 450.00, 'per_month', 1, 1, 2,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Workspace'],
 9.5700, 44.0600,
 (SELECT id FROM locations WHERE name = 'Hargeisa' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440001',
 false, true, 4.75, 12, '/month')

ON CONFLICT (id) DO NOTHING;

-- Berbera Properties (3 properties)
INSERT INTO properties (
    id, title, description, type, purpose, status, price, price_unit, bedrooms, bathrooms,
    max_guests, amenities, lat, lng, location_id, owner_id,
    is_featured, is_approved, rating_avg, review_count, price_unit_label
) VALUES
-- Berbera Beachfront Studio
('550e8400-e29b-41d4-a716-446655440005',
 'Beachfront Studio Berbera',
 'Cozy studio apartment just steps from the beach with ocean views and modern amenities.',
 'studio', 'short_stay', 'active', 95.00, 'per_night', 1, 1, 2,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Beach Access'],
 10.4167, 45.0167,
 (SELECT id FROM locations WHERE name = 'Berbera' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440002',
 true, true, 4.78, 33, 'for 2 nights'),

-- Berbera Port House
('550e8400-e29b-41d4-a716-446655440006',
 'Berbera Port House',
 'Spacious house near the port with traditional Somali architecture and modern comforts.',
 'house', 'sale', 'active', 180000.00, 'total', 4, 2, 8,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Laundry'],
 10.4267, 45.0267,
 (SELECT id FROM locations WHERE name = 'Berbera' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440002',
 false, true, 4.91, 15, ''),

-- Berbera Modern Apartment
('550e8400-e29b-41d4-a716-446655440007',
 'Modern Berbera Apartment',
 'Contemporary apartment with sea views, perfect for professionals working at the port.',
 'apartment', 'long_rent', 'active', 650.00, 'per_month', 2, 1, 4,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Balcony'],
 10.4067, 45.0067,
 (SELECT id FROM locations WHERE name = 'Berbera' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440002',
 false, true, 4.82, 21, '/month')

ON CONFLICT (id) DO NOTHING;

-- Borama Properties (3 properties)
INSERT INTO properties (
    id, title, description, type, purpose, status, price, price_unit, bedrooms, bathrooms,
    max_guests, amenities, lat, lng, location_id, owner_id,
    is_featured, is_approved, rating_avg, review_count, price_unit_label
) VALUES
-- Borama Countryside Villa
('550e8400-e29b-41d4-a716-446655440008',
 'Borama Countryside Villa',
 'Elegant villa surrounded by beautiful countryside, perfect for those seeking peace and tranquility.',
 'villa', 'long_rent', 'active', 750.00, 'per_month', 4, 3, 8,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Gym', 'Security System'],
 10.0667, 43.1667,
 (SELECT id FROM locations WHERE name = 'Borama' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440003',
 true, true, 4.88, 22, '/month'),

-- Borama Modern Apartment
('550e8400-e29b-41d4-a716-446655440009',
 'Modern Borama Apartment',
 'Contemporary apartment with all modern amenities in the growing city of Borama.',
 'apartment', 'short_stay', 'active', 110.00, 'per_night', 2, 1, 4,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Elevator'],
 10.0767, 43.1767,
 (SELECT id FROM locations WHERE name = 'Borama' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440003',
 false, true, 4.75, 18, 'for 2 nights'),

-- Borama Family House
('550e8400-e29b-41d4-a716-446655440010',
 'Borama Family House',
 'Spacious family house with large garden, perfect for families with children.',
 'house', 'sale', 'active', 145000.00, 'total', 5, 3, 10,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Laundry', 'Security System'],
 10.0567, 43.1567,
 (SELECT id FROM locations WHERE name = 'Borama' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440003',
 false, true, 4.86, 17, '')

ON CONFLICT (id) DO NOTHING;

-- Nairobi Properties (2 properties - limited for frontend compatibility)
INSERT INTO properties (
    id, title, description, type, purpose, status, price, price_unit, bedrooms, bathrooms,
    max_guests, amenities, lat, lng, location_id, owner_id,
    is_featured, is_approved, rating_avg, review_count, price_unit_label
) VALUES
-- Nairobi Skyper Apartment
('550e8400-e29b-41d4-a716-446655440011',
 'Skyper Pool Apartment',
 'Modern apartment with pool access and city views in upscale Nairobi neighborhood.',
 'apartment', 'sale', 'active', 280000.00, 'total', 4, 2, 6,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Laundry', 'Security System'],
 -1.2921, 36.8219,
 (SELECT id FROM locations WHERE name = 'Nairobi' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440004',
 true, true, 4.87, 45, ''),

-- Nairobi Karen Villa
('550e8400-e29b-41d4-a716-446655440012',
 'Karen Garden Villa',
 'Luxurious villa in prestigious Karen area with beautiful gardens and security.',
 'villa', 'short_stay', 'active', 320.00, 'per_night', 5, 3, 10,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Pool', 'Gym', 'Security System'],
 -1.3121, 36.8419,
 (SELECT id FROM locations WHERE name = 'Nairobi' LIMIT 1),
 '550e8400-e29b-41d4-a716-446655440004',
 true, true, 4.93, 72, 'for 2 nights')

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. INSERT PROPERTY IMAGES
-- ========================================

INSERT INTO property_images (property_id, url, is_primary, sort_order) VALUES
-- Hargeisa Properties
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', false, 2),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', false, 3),

('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', true, 1),

('550e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1560185127-6a12f9a26fe5?w=800&q=80', true, 1),

-- Berbera Properties
('550e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1600210492486-8cc7c9e0c7f1?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', true, 1),

('550e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', true, 1),

-- Borama Properties
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', true, 1),

('550e8400-e29b-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', true, 1),

-- Nairobi Properties
('550e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', false, 2),

('550e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', true, 1),
('550e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', false, 2)

ON CONFLICT DO NOTHING;

-- ========================================
-- 3. INSERT SAMPLE REVIEWS
-- ========================================

INSERT INTO property_reviews (property_id, guest_id, rating, comment) VALUES
-- Reviews for featured properties
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 5, 'Absolutely stunning penthouse! The views are incredible and the host was very responsive.'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 5, 'Perfect location in Hargeisa. Clean, modern, and exactly as described.'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440103', 5, 'Beautiful villa with amazing garden. Perfect for our family vacation.'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440104', 4, 'Lovely property, great amenities. Only minor issue was WiFi speed.'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440105', 5, 'Amazing beachfront location! Woke up to ocean views every morning.'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440106', 5, 'Peaceful countryside setting. Perfect escape from city life.'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440107', 5, 'Luxury apartment in great Nairobi location. Security and amenities are top-notch.'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440108', 5, 'Karen villa exceeded expectations. Garden and pool are magnificent.')

ON CONFLICT (property_id, guest_id) DO NOTHING;

-- ========================================
-- 4. UPDATE RATING COUNTS (trigger should handle this, but ensuring data consistency)
-- ========================================

-- This will trigger the rating update function
UPDATE property_reviews SET comment = comment WHERE id IN (
    SELECT id FROM property_reviews LIMIT 10
);

-- ========================================
-- 5. CREATE SAMPLE WISHLIST ENTRIES
-- ========================================

INSERT INTO wishlists (user_id, property_id) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440008'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440011')

ON CONFLICT (user_id, property_id) DO NOTHING;
