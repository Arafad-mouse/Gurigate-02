-- GuriGate Properties Seed Data V2
-- Matches current schema with property_addresses, property_pricing, property_bathrooms, and approval workflow

-- ========================================
-- 1. INSERT PROFILES (Hosts)
-- ========================================

INSERT INTO profiles (id, full_name, avatar_url, role) VALUES
('00000000-0000-0000-0000-000000000001', 'Ahmed Hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'host'),
('00000000-0000-0000-0000-000000000002', 'Fatima Ali', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 'host'),
('00000000-0000-0000-0000-000000000003', 'Mohamed Ibrahim', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', 'host')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. INSERT PROPERTIES
-- ========================================

INSERT INTO properties (
    id, title, description, type, property_category, listing_type,
    approval_status, status, published, is_featured,
    owner_id, view_count, created_at
) VALUES
-- Hargeisa Properties
('10000000-0000-0000-0000-000000000001',
 'Modern Penthouse in Hargeisa',
 'Luxurious penthouse with stunning city views and modern amenities. Perfect for business travelers and couples seeking comfort and style.',
 'apartment', 'residential', 'short_stay',
 'approved', 'available', true, true,
 '00000000-0000-0000-0000-000000000001', 128, NOW() - INTERVAL '30 days'),

('10000000-0000-0000-0000-000000000002',
 'Garden Oasis Villa',
 'Beautiful villa with private garden, swimming pool, and spacious living areas. Ideal for families and longer stays.',
 'villa', 'residential', 'short_stay',
 'approved', 'available', true, true,
 '00000000-0000-0000-0000-000000000001', 95, NOW() - INTERVAL '45 days'),

('10000000-0000-0000-0000-000000000003',
 'Downtown Hargeisa Apartment',
 'Modern apartment in the heart of Hargeisa with easy access to markets, restaurants, and business centers.',
 'apartment', 'residential', 'long_rent',
 'approved', 'available', true, false,
 '00000000-0000-0000-0000-000000000001', 67, NOW() - INTERVAL '60 days'),

-- Berbera Properties
('10000000-0000-0000-0000-000000000004',
 'Beachfront Studio Berbera',
 'Cozy studio apartment just steps from the beach with ocean views and modern amenities.',
 'studio', 'residential', 'short_stay',
 'approved', 'available', true, true,
 '00000000-0000-0000-0000-000000000002', 142, NOW() - INTERVAL '25 days'),

('10000000-0000-0000-0000-000000000005',
 'Berbera Port House',
 'Spacious house near the port with traditional Somali architecture and modern comforts.',
 'house', 'residential', 'sale',
 'approved', 'available', true, false,
 '00000000-0000-0000-0000-000000000002', 88, NOW() - INTERVAL '50 days'),

-- Borama Properties
('10000000-0000-0000-0000-000000000006',
 'Borama Countryside Villa',
 'Elegant villa surrounded by beautiful countryside, perfect for those seeking peace and tranquility.',
 'villa', 'residential', 'long_rent',
 'approved', 'available', true, true,
 '00000000-0000-0000-0000-000000000003', 76, NOW() - INTERVAL '40 days'),

('10000000-0000-0000-0000-000000000007',
 'Modern Borama Apartment',
 'Contemporary apartment with all modern amenities in the growing city of Borama.',
 'apartment', 'residential', 'short_stay',
 'approved', 'available', true, false,
 '00000000-0000-0000-0000-000000000003', 54, NOW() - INTERVAL '55 days'),

-- Nairobi Properties
('10000000-0000-0000-0000-000000000008',
 'Skyper Pool Apartment',
 'Modern apartment with pool access and city views in upscale Nairobi neighborhood.',
 'apartment', 'residential', 'sale',
 'approved', 'available', true, true,
 '00000000-0000-0000-0000-000000000001', 203, NOW() - INTERVAL '20 days'),

('10000000-0000-0000-0000-000000000009',
 'Karen Garden Villa',
 'Luxurious villa in prestigious Karen area with beautiful gardens and security.',
 'villa', 'residential', 'short_stay',
 'approved', 'available', true, true,
 '00000000-0000-0000-0000-000000000002', 187, NOW() - INTERVAL '35 days'),

('10000000-0000-0000-0000-000000000010',
 'Westlands Modern Studio',
 'Sleek studio apartment in Westlands with modern finishes and great amenities.',
 'studio', 'residential', 'long_rent',
 'approved', 'available', true, false,
 '00000000-0000-0000-0000-000000000003', 45, NOW() - INTERVAL '70 days')

ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. INSERT PROPERTY ADDRESSES
-- ========================================

INSERT INTO property_addresses (
    property_id, street, apartment, city, state, postal_code, country,
    latitude, longitude, show_precise_location
) VALUES
-- Hargeisa
('10000000-0000-0000-0000-000000000001', 'Sheikh Nur Street', 'Penthouse A', 'Hargeisa', 'Maroodi Jeex', 'SL1 001', 'Somalia', 9.5600, 44.0650, true),
('10000000-0000-0000-0000-000000000002', 'Garden District Road', NULL, 'Hargeisa', 'Maroodi Jeex', 'SL1 002', 'Somalia', 9.5500, 44.0750, true),
('10000000-0000-0000-0000-000000000003', 'Main Street', 'Apt 4B', 'Hargeisa', 'Maroodi Jeex', 'SL1 003', 'Somalia', 9.5650, 44.0550, true),
-- Berbera
('10000000-0000-0000-0000-000000000004', 'Beach Road', 'Studio 1', 'Berbera', 'Sahil', 'SL2 001', 'Somalia', 10.4167, 45.0167, true),
('10000000-0000-0000-0000-000000000005', 'Port Avenue', NULL, 'Berbera', 'Sahil', 'SL2 002', 'Somalia', 10.4267, 45.0267, true),
-- Borama
('10000000-0000-0000-0000-000000000006', 'Countryside Lane', NULL, 'Borama', 'Awdal', 'SL3 001', 'Somalia', 10.0667, 43.1667, true),
('10000000-0000-0000-0000-000000000007', 'Modern Street', 'Apt 2C', 'Borama', 'Awdal', 'SL3 002', 'Somalia', 10.0767, 43.1767, true),
-- Nairobi
('10000000-0000-0000-0000-000000000008', 'Westlands Road', 'Penthouse B', 'Nairobi', 'Nairobi County', '00100', 'Kenya', -1.2921, 36.8219, true),
('10000000-0000-0000-0000-000000000009', 'Karen Lane', NULL, 'Nairobi', 'Nairobi County', '00200', 'Kenya', -1.3121, 36.8419, true),
('10000000-0000-0000-0000-000000000010', 'Parklands Road', 'Studio 5', 'Nairobi', 'Nairobi County', '00300', 'Kenya', -1.2621, 36.8019, true)

ON CONFLICT (property_id) DO NOTHING;

-- ========================================
-- 4. INSERT PROPERTY IMAGES
-- ========================================

INSERT INTO property_images (property_id, image_url, alt_text, is_primary, sort_order) VALUES
-- Hargeisa
('10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 'Modern penthouse living room', true, 1),
('10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', 'Penthouse bedroom with city view', false, 2),
('10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', 'Penthouse kitchen', false, 3),

('10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', 'Villa exterior with garden', true, 1),
('10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'Villa swimming pool', false, 2),

('10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'Modern apartment interior', true, 1),

-- Berbera
('10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'Beachfront studio view', true, 1),
('10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1600210492486-8cc7c9e0c7f1?w=800&q=80', 'Studio interior', false, 2),

('10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'Traditional house exterior', true, 1),

-- Borama
('10000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'Countryside villa', true, 1),
('10000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'Villa garden', false, 2),

('10000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', 'Modern apartment', true, 1),

-- Nairobi
('10000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'Luxury apartment with pool', true, 1),
('10000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', 'Apartment city view', false, 2),

('10000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', 'Karen villa exterior', true, 1),
('10000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'Villa garden and pool', false, 2),

('10000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'Modern studio', true, 1)

ON CONFLICT DO NOTHING;

-- ========================================
-- 5. INSERT PROPERTY PRICING
-- ========================================

INSERT INTO property_pricing (
    property_id, base_price, currency, pricing_type,
    security_deposit, cleaning_fee, service_fee
) VALUES
-- Hargeisa
('10000000-0000-0000-0000-000000000001', 120.00, 'USD', 'nightly', 200.00, 50.00, 15.00),
('10000000-0000-0000-0000-000000000002', 245.00, 'USD', 'nightly', 400.00, 75.00, 25.00),
('10000000-0000-0000-0000-000000000003', 850.00, 'USD', 'monthly', NULL, NULL, NULL),
-- Berbera
('10000000-0000-0000-0000-000000000004', 95.00, 'USD', 'nightly', 150.00, 40.00, 12.00),
('10000000-0000-0000-0000-000000000005', 180000.00, 'USD', 'total', NULL, NULL, NULL),
-- Borama
('10000000-0000-0000-0000-000000000006', 750.00, 'USD', 'monthly', NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000007', 110.00, 'USD', 'nightly', 180.00, 45.00, 14.00),
-- Nairobi
('10000000-0000-0000-0000-000000000008', 280000.00, 'USD', 'total', NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000009', 320.00, 'USD', 'nightly', 500.00, 80.00, 30.00),
('10000000-0000-0000-0000-000000000010', 650.00, 'USD', 'monthly', NULL, NULL, NULL)

ON CONFLICT (property_id) DO NOTHING;

-- ========================================
-- 6. INSERT PROPERTY BATHROOMS
-- ========================================

INSERT INTO property_bathrooms (
    property_id, private_attached, dedicated, shared
) VALUES
('10000000-0000-0000-0000-000000000001', 2, 0, 0),
('10000000-0000-0000-0000-000000000002', 3, 0, 0),
('10000000-0000-0000-0000-000000000003', 1, 0, 0),
('10000000-0000-0000-0000-000000000004', 1, 0, 0),
('10000000-0000-0000-0000-000000000005', 2, 0, 0),
('10000000-0000-0000-0000-000000000006', 3, 0, 0),
('10000000-0000-0000-0000-000000000007', 1, 0, 0),
('10000000-0000-0000-0000-000000000008', 2, 0, 0),
('10000000-0000-0000-0000-000000000009', 3, 0, 0),
('10000000-0000-0000-0000-000000000010', 1, 0, 0)

ON CONFLICT (property_id) DO NOTHING;

-- ========================================
-- 7. INSERT PROPERTY FEATURES (for bedrooms, max_guests, etc.)
-- ========================================

INSERT INTO property_features (
    property_id, bedrooms, beds, max_guests, amenities, rules
) VALUES
('10000000-0000-0000-0000-000000000001', 3, 3, 4, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Workspace', 'Elevator', 'Balcony'], ARRAY['No smoking', 'No pets']),
('10000000-0000-0000-0000-000000000002', 5, 5, 10, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Garden', 'Gym', 'Laundry'], ARRAY['No smoking', 'Check-in after 2pm']),
('10000000-0000-0000-0000-000000000003', 2, 2, 3, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace'], ARRAY['No smoking']),
('10000000-0000-0000-0000-000000000004', 1, 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Beach Access'], ARRAY['No smoking']),
('10000000-0000-0000-0000-000000000005', 4, 4, 8, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Laundry'], ARRAY['No smoking', 'No pets']),
('10000000-0000-0000-0000-000000000006', 4, 4, 8, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Gym', 'Security System'], ARRAY['No smoking']),
('10000000-0000-0000-0000-000000000007', 2, 2, 4, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Elevator'], ARRAY['No smoking']),
('10000000-0000-0000-0000-000000000008', 4, 4, 6, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Laundry', 'Security System'], ARRAY['No smoking', 'No pets']),
('10000000-0000-0000-0000-000000000009', 5, 5, 10, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Pool', 'Gym', 'Security System'], ARRAY['No smoking', 'No pets', 'Check-in after 3pm']),
('10000000-0000-0000-0000-000000000010', 1, 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace'], ARRAY['No smoking'])

ON CONFLICT (property_id) DO NOTHING;
