-- GuriGate Properties Seed Data
-- East African cities: Hargeisa, Berbera, Borama, Mogadishu, Nairobi

-- ========================================
-- 1. INSERT SAMPLE PROPERTIES
-- ========================================

-- Hargeisa Properties
INSERT INTO properties (
  id, title, description, type, badge, price_unit_label, is_featured, is_approved, rating, review_count
) VALUES
-- Featured Hargeisa Properties
('550e8400-e29b-41d4-a716-446655440001', 'Modern Penthouse in Kileleshwa', 'Luxurious penthouse with stunning city views and modern amenities. Perfect for business travelers and couples seeking comfort and style.', 'penthouse', 'SHORT_STAY', 'for 2 nights', true, true, 5.0, 28),
('550e8400-e29b-41d4-a716-446655440002', 'Garden Oasis Villa', 'Beautiful villa with private garden, swimming pool, and spacious living areas. Ideal for families and longer stays.', 'villa', 'SHORT_STAY', 'for 2 nights', true, true, 4.92, 41),
('550e8400-e29b-41d4-a716-446655440003', 'Downtown Hargeisa Apartment', 'Modern apartment in the heart of Hargeisa with easy access to markets, restaurants, and business centers.', 'apartment', 'FOR_RENT', '/month', false, true, 4.85, 19),

-- Berbera Properties  
('550e8400-e29b-41d4-a716-446655440004', 'Beachfront Studio Berbera', 'Cozy studio apartment just steps from the beach with ocean views and modern amenities.', 'studio', 'SHORT_STAY', 'for 2 nights', true, true, 4.78, 33),
('550e8400-e29b-41d4-a716-446655440005', 'Berbera Port House', 'Spacious house near the port with traditional Somali architecture and modern comforts.', 'house', 'FOR_SALE', '', false, true, 4.91, 15),

-- Borama Properties
('550e8400-e29b-41d4-a716-446655440006', 'Borama Countryside Villa', 'Elegant villa surrounded by beautiful countryside, perfect for those seeking peace and tranquility.', 'villa', 'FOR_RENT', '/month', true, true, 4.88, 22),
('550e8400-e29b-41d4-a716-446655440007', 'Modern Borama Apartment', 'Contemporary apartment with all modern amenities in the growing city of Borama.', 'apartment', 'SHORT_STAY', 'for 2 nights', false, true, 4.75, 18),

-- Mogadishu Properties
('550e8400-e29b-41d4-a716-446655440008', 'Luxury Mogadishu Penthouse', 'Ultra-luxury penthouse with panoramic ocean views, private elevator, and premium finishes.', 'penthouse', 'FOR_SALE', '', true, true, 4.99, 67),
('550e8400-e29b-41d4-a716-446655440009', 'Mogadishu Beach Resort', 'Beachfront resort property with direct beach access, pool, and world-class amenities.', 'villa', 'SHORT_STAY', 'for 2 nights', true, true, 4.95, 89),
('550e8400-e29b-41d4-a716-446655440010', 'Downtown Mogadishu Loft', 'Industrial-chic loft in the heart of Mogadishu business district.', 'loft', 'FOR_RENT', '/month', false, true, 4.82, 31),

-- Nairobi Properties (limited as requested)
('550e8400-e29b-41d4-a716-446655440011', 'Skyper Pool Apartment', 'Modern apartment with pool access and city views in upscale Nairobi neighborhood.', 'apartment', 'FOR_SALE', '', true, true, 4.87, 45),
('550e8400-e29b-41d4-a716-446655440012', 'Karen Garden Villa', 'Luxurious villa in prestigious Karen area with beautiful gardens and security.', 'villa', 'SHORT_STAY', 'for 2 nights', true, true, 4.93, 72),
('550e8400-e29b-41d4-a716-446655440013', 'Westlands Executive Suite', 'Executive suite in prime Westlands location, perfect for business travelers.', 'studio', 'SHORT_STAY', 'for 2 nights', false, true, 4.79, 28);

-- ========================================
-- 2. INSERT PROPERTY ADDRESSES
-- ========================================

INSERT INTO property_addresses (
  property_id, street, city, state, postal_code, country, latitude, longitude
) VALUES
-- Hargeisa
('550e8400-e29b-41d4-a716-446655440001', 'Kileleshwa Road', 'Hargeisa', 'Maroodi Jeex', 'HL001', 'Somalia', 9.5600, 44.0650),
('550e8400-e29b-41d4-a716-446655440002', 'Garden District', 'Hargeisa', 'Maroodi Jeex', 'HL002', 'Somalia', 9.5500, 44.0750),
('550e8400-e29b-41d4-a716-446655440003', 'Main Street', 'Hargeisa', 'Maroodi Jeex', 'HL003', 'Somalia', 9.5650, 44.0550),

-- Berbera
('550e8400-e29b-41d4-a716-446655440004', 'Beach Road', 'Berbera', 'Sahil', 'BR001', 'Somalia', 10.4167, 45.0167),
('550e8400-e29b-41d4-a716-446655440005', 'Port Street', 'Berbera', 'Sahil', 'BR002', 'Somalia', 10.4267, 45.0267),

-- Borama
('550e8400-e29b-41d4-a716-446655440006', 'Countryside Lane', 'Borama', 'Awdal', 'BO001', 'Somalia', 10.0667, 43.1667),
('550e8400-e29b-41d4-a716-446655440007', 'Modern Avenue', 'Borama', 'Awdal', 'BO002', 'Somalia', 10.0767, 43.1767),

-- Mogadishu
('550e8400-e29b-41d4-a716-446655440008', 'Ocean Drive', 'Mogadishu', 'Banaadir', 'MG001', 'Somalia', 2.0469, 45.3182),
('550e8400-e29b-41d4-a716-446655440009', 'Beach Boulevard', 'Mogadishu', 'Banaadir', 'MG002', 'Somalia', 2.0569, 45.3282),
('550e8400-e29b-41d4-a716-446655440010', 'Business District', 'Mogadishu', 'Banaadir', 'MG003', 'Somalia', 2.0369, 45.3082),

-- Nairobi
('550e8400-e29b-41d4-a716-446655440011', 'Skyper Tower', 'Nairobi', 'Nairobi County', 'NB001', 'Kenya', -1.2921, 36.8219),
('550e8400-e29b-41d4-a716-446655440012', 'Karen Lane', 'Nairobi', 'Nairobi County', 'NB002', 'Kenya', -1.3121, 36.8419),
('550e8400-e29b-41d4-a716-446655440013', 'Westlands Plaza', 'Nairobi', 'Nairobi County', 'NB003', 'Kenya', -1.2621, 36.8019);

-- ========================================
-- 3. INSERT PROPERTY PRICING
-- ========================================

INSERT INTO property_pricing (
  property_id, base_price, currency, pricing_type, security_deposit, cleaning_fee, service_fee
) VALUES
-- Hargeisa
('550e8400-e29b-41d4-a716-446655440001', 120.00, 'USD', 'nightly', 200.00, 25.00, 15.00),
('550e8400-e29b-41d4-a716-446655440002', 245.00, 'USD', 'nightly', 300.00, 35.00, 20.00),
('550e8400-e29b-41d4-a716-446655440003', 850.00, 'USD', 'monthly', 500.00, 50.00, 30.00),

-- Berbera
('550e8400-e29b-41d4-a716-446655440004', 95.00, 'USD', 'nightly', 150.00, 20.00, 12.00),
('550e8400-e29b-41d4-a716-446655440005', 180000.00, 'USD', 'sale', 0.00, 0.00, 0.00),

-- Borama
('550e8400-e29b-41d4-a716-446655440006', 750.00, 'USD', 'monthly', 400.00, 45.00, 25.00),
('550e8400-e29b-41d4-a716-446655440007', 110.00, 'USD', 'nightly', 180.00, 22.00, 14.00),

-- Mogadishu
('550e8400-e29b-41d4-a716-446655440008', 450000.00, 'USD', 'sale', 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440009', 380.00, 'USD', 'nightly', 500.00, 50.00, 30.00),
('550e8400-e29b-41d4-a716-446655440010', 1200.00, 'USD', 'monthly', 600.00, 60.00, 35.00),

-- Nairobi
('550e8400-e29b-41d4-a716-446655440011', 280000.00, 'USD', 'sale', 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440012', 320.00, 'USD', 'nightly', 400.00, 45.00, 25.00),
('550e8400-e29b-41d4-a716-446655440013', 150.00, 'USD', 'nightly', 200.00, 25.00, 15.00);

-- ========================================
-- 4. INSERT PROPERTY FEATURES
-- ========================================

INSERT INTO property_features (
  property_id, bedrooms, bathrooms, max_guests, square_feet, amenities, rules
) VALUES
-- Hargeisa
('550e8400-e29b-41d4-a716-446655440001', 3, 2, 4, 320, 
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Workspace', 'Elevator', 'Balcony'],
 ARRAY['No smoking', 'No parties', 'Quiet hours', 'Check-in after 3 PM', 'Check-out before 11 AM']),
('550e8400-e29b-41d4-a716-446655440002', 5, 3, 10, 600,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Garden', 'Gym', 'Laundry'],
 ARRAY['No smoking', 'No parties', 'No pets', 'Respect neighbors', 'Additional fees for extra guests']),
('550e8400-e29b-41d4-a716-446655440003', 2, 1, 3, 280,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace'],
 ARRAY['No smoking', 'Quiet hours', 'Check-in after 2 PM']),

-- Berbera
('550e8400-e29b-41d4-a716-446655440004', 1, 1, 2, 180,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Beach Access'],
 ARRAY['No smoking', 'Quiet hours', 'Beach rules apply']),
('550e8400-e29b-41d4-a716-446655440005', 4, 2, 8, 450,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Laundry'],
 ARRAY['No smoking', 'No parties', 'Respect neighbors']),

-- Borama
('550e8400-e29b-41d4-a716-446655440006', 4, 3, 8, 520,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Gym', 'Security System'],
 ARRAY['No smoking', 'No parties', 'No pets', 'Quiet hours']),
('550e8400-e29b-41d4-a716-446655440007', 2, 1, 4, 300,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Elevator'],
 ARRAY['No smoking', 'Quiet hours', 'Check-in after 2 PM']),

-- Mogadishu
('550e8400-e29b-41d4-a716-446655440008', 6, 4, 12, 800,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Laundry', 'Security System', 'Elevator', 'Balcony'],
 ARRAY['No smoking', 'No parties', 'No pets', 'Quiet hours', 'Formal dress code in common areas']),
('550e8400-e29b-41d4-a716-446655440009', 5, 3, 10, 650,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Beach Access', 'Gym', 'Laundry', 'Restaurant'],
 ARRAY['No smoking', 'No parties', 'Respect other guests', 'Beach rules apply']),
('550e8400-e29b-41d4-a716-446655440010', 2, 1, 3, 350,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Elevator'],
 ARRAY['No smoking', 'Quiet hours', 'Business district rules']),

-- Nairobi
('550e8400-e29b-41d4-a716-446655440011', 4, 2, 6, 450,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Laundry', 'Security System'],
 ARRAY['No smoking', 'No parties', 'Quiet hours', 'Building rules']),
('550e8400-e29b-41d4-a716-446655440012', 5, 3, 10, 600,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Pool', 'Gym', 'Security System'],
 ARRAY['No smoking', 'No parties', 'No pets', 'Quiet hours', 'Gated community rules']),
('550e8400-e29b-41d4-a716-446655440013', 1, 1, 2, 220,
 ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Elevator'],
 ARRAY['No smoking', 'Quiet hours', 'Business district rules']);

-- ========================================
-- 5. INSERT PROPERTY IMAGES
-- ========================================

INSERT INTO property_images (
  property_id, image_url, alt_text, sort_order, is_primary
) VALUES
-- Hargeisa Properties
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 'Modern penthouse living room', 1, true),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', 'Penthouse bedroom', 2, false),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', 'Penthouse bathroom', 3, false),

('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', 'Garden villa exterior', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'Villa living room', 2, false),

('550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'Modern apartment kitchen', 1, true),

-- Berbera Properties
('550e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'Beachfront studio', 1, true),
('550e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'Port house exterior', 1, true),

-- Borama Properties
('550e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'Countryside villa', 1, true),
('550e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'Modern apartment', 1, true),

-- Mogadishu Properties
('550e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'Luxury penthouse', 1, true),
('550e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', 'Beach resort', 1, true),
('550e8400-e29b-41d4-a716-446655440010', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'Downtown loft', 1, true),

-- Nairobi Properties
('550e8400-e29b-41d4-a716-446655440011', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'Skyper apartment', 1, true),
('550e8400-e29b-41d4-a716-446655440012', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'Karen villa', 1, true),
('550e8400-e29b-41d4-a716-446655440013', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'Westlands suite', 1, true);

-- ========================================
-- 6. INSERT SAMPLE REVIEWS
-- ========================================

INSERT INTO property_reviews (
  property_id, guest_id, rating, comment
) VALUES
-- Sample reviews for featured properties
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 5, 'Absolutely stunning penthouse! The views are incredible and the host was very responsive.'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 5, 'Perfect location in Hargeisa. Clean, modern, and exactly as described.'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440103', 5, 'Beautiful villa with amazing garden. Perfect for our family vacation.'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440104', 4, 'Lovely property, great amenities. Only minor issue was WiFi speed.'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440105', 5, 'Ultimate luxury! The penthouse exceeded all expectations. Worth every penny.'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440106', 5, 'Amazing villa in Karen. Security, privacy, and beautiful surroundings.'),

-- ========================================
-- 7. SET OWNER IDs (placeholder - should be actual user IDs)
-- ========================================

-- Update properties with placeholder owner IDs
-- In production, these would be actual authenticated user IDs
UPDATE properties SET owner_id = '550e8400-e29b-41d4-a716-446655440001' WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'
);

UPDATE properties SET owner_id = '550e8400-e29b-41d4-a716-446655440002' WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'
);

UPDATE properties SET owner_id = '550e8400-e29b-41d4-a716-446655440003' WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007'
);

UPDATE properties SET owner_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010'
);

UPDATE properties SET owner_id = '550e8400-e29b-41d4-a716-446655440005' WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440013'
);

-- ========================================
-- 8. CREATE SAMPLE USERS FOR TESTING
-- ========================================

-- Note: In production, these would be real authenticated users
-- For development, we'll create placeholder user records in auth.users
-- This would typically be done through Supabase Auth UI or API
