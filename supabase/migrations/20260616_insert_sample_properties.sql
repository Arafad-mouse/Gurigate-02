-- Insert Sample Properties from GuriGateProperty Component
-- Date: 2026-06-16
-- Purpose: Populate database with sample property listings

-- Note: This migration uses a placeholder owner_id
-- You should update these records with actual user IDs after creation

-- Temporarily disable RLS to allow insertion
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_features DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_images DISABLE ROW LEVEL SECURITY;

INSERT INTO properties (
  id,
  owner_id,
  title,
  description,
  type,
  status,
  is_approved,
  is_featured,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'New York',
    'Beautiful house located in France. Size: 1400ft.',
    'house',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Washington Residence',
    'Beautiful villa located in Canada. Size: 1600ft.',
    'villa',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'London Residence',
    'Beautiful house located in England. Size: 1600ft.',
    'house',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Grand Resort Villa',
    'Beautiful villa located in Canada. Size: 1600ft.',
    'villa',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'House Residence',
    'Beautiful house located in France. Size: 1400ft.',
    'house',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Paris Square',
    'Beautiful villa located in German. Size: 1200ft.',
    'villa',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Canada Residence',
    'Beautiful villa located in Portugal. Size: 2400ft.',
    'villa',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Luxury Penthouse',
    'Beautiful house located in Thailand. Size: 2200ft.',
    'penthouse',
    'active',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Duplex Bungalow',
    'Beautiful house located in America. Size: 2200ft.',
    'house',
    'active',
    true,
    false,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Insert property pricing for each property
INSERT INTO property_pricing (
  property_id,
  base_price,
  currency,
  pricing_type,
  security_deposit,
  cleaning_fee,
  service_fee,
  created_at
)
SELECT 
  p.id,
  CASE 
    WHEN p.title = 'New York' THEN 250
    WHEN p.title = 'Washington Residence' THEN 87
    WHEN p.title = 'London Residence' THEN 200
    WHEN p.title = 'Grand Resort Villa' THEN 350
    WHEN p.title = 'House Residence' THEN 350
    WHEN p.title = 'Paris Square' THEN 250
    WHEN p.title = 'Canada Residence' THEN 150
    WHEN p.title = 'Luxury Penthouse' THEN 540
    WHEN p.title = 'Duplex Bungalow' THEN 1500
    ELSE 200
  END,
  'USD',
  'nightly',
  100,
  50,
  10,
  NOW()
FROM properties p
WHERE p.owner_id = '00000000-0000-0000-0000-000000000000'
  AND NOT EXISTS (
    SELECT 1 FROM property_pricing pp WHERE pp.property_id = p.id
  )
ON CONFLICT DO NOTHING;

-- Insert property features for each property
INSERT INTO property_features (
  property_id,
  bedrooms,
  bathrooms,
  max_guests,
  square_feet,
  amenities,
  rules,
  created_at
)
SELECT 
  p.id,
  CASE 
    WHEN p.title = 'New York' THEN 5
    WHEN p.title = 'Washington Residence' THEN 3
    WHEN p.title = 'London Residence' THEN 4
    WHEN p.title = 'Grand Resort Villa' THEN 5
    WHEN p.title = 'House Residence' THEN 3
    WHEN p.title = 'Paris Square' THEN 3
    WHEN p.title = 'Canada Residence' THEN 6
    WHEN p.title = 'Luxury Penthouse' THEN 6
    WHEN p.title = 'Duplex Bungalow' THEN 6
    ELSE 2
  END,
  CASE 
    WHEN p.title = 'New York' THEN 3
    WHEN p.title = 'Washington Residence' THEN 2
    WHEN p.title = 'London Residence' THEN 2
    WHEN p.title = 'Grand Resort Villa' THEN 3
    WHEN p.title = 'House Residence' THEN 2
    WHEN p.title = 'Paris Square' THEN 2
    WHEN p.title = 'Canada Residence' THEN 3
    WHEN p.title = 'Luxury Penthouse' THEN 4
    WHEN p.title = 'Duplex Bungalow' THEN 3
    ELSE 1
  END,
  CASE 
    WHEN p.title = 'New York' THEN 10
    WHEN p.title = 'Washington Residence' THEN 6
    WHEN p.title = 'London Residence' THEN 8
    WHEN p.title = 'Grand Resort Villa' THEN 10
    WHEN p.title = 'House Residence' THEN 6
    WHEN p.title = 'Paris Square' THEN 6
    WHEN p.title = 'Canada Residence' THEN 12
    WHEN p.title = 'Luxury Penthouse' THEN 12
    WHEN p.title = 'Duplex Bungalow' THEN 12
    ELSE 4
  END,
  CASE 
    WHEN p.title = 'New York' THEN 1400
    WHEN p.title = 'Washington Residence' THEN 1600
    WHEN p.title = 'London Residence' THEN 1600
    WHEN p.title = 'Grand Resort Villa' THEN 1600
    WHEN p.title = 'House Residence' THEN 1400
    WHEN p.title = 'Paris Square' THEN 1200
    WHEN p.title = 'Canada Residence' THEN 2400
    WHEN p.title = 'Luxury Penthouse' THEN 2200
    WHEN p.title = 'Duplex Bungalow' THEN 2200
    ELSE 1000
  END,
  ARRAY['WiFi', 'Kitchen', 'Parking', 'Air Conditioning'],
  ARRAY['No smoking', 'No pets', 'Quiet hours after 10 PM'],
  NOW()
FROM properties p
WHERE p.owner_id = '00000000-0000-0000-0000-000000000000'
  AND NOT EXISTS (
    SELECT 1 FROM property_features pf WHERE pf.property_id = p.id
  )
ON CONFLICT DO NOTHING;

-- Insert property images for each property
INSERT INTO property_images (
  property_id,
  image_url,
  alt_text,
  sort_order,
  is_primary,
  created_at
)
SELECT 
  p.id,
  CASE 
    WHEN p.title = 'New York' THEN 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=80'
    WHEN p.title = 'Washington Residence' THEN 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&q=80'
    WHEN p.title = 'London Residence' THEN 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=60&q=80'
    WHEN p.title = 'Grand Resort Villa' THEN 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=60&q=80'
    WHEN p.title = 'House Residence' THEN 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=60&q=80'
    WHEN p.title = 'Paris Square' THEN 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=60&q=80'
    WHEN p.title = 'Canada Residence' THEN 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=60&q=80'
    WHEN p.title = 'Luxury Penthouse' THEN 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=60&q=80'
    WHEN p.title = 'Duplex Bungalow' THEN 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=60&q=80'
    ELSE 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=80'
  END,
  p.title || ' - Primary Image',
  0,
  true,
  NOW()
FROM properties p
WHERE p.owner_id = '00000000-0000-0000-0000-000000000000'
  AND NOT EXISTS (
    SELECT 1 FROM property_images pi WHERE pi.property_id = p.id
  )
ON CONFLICT DO NOTHING;

-- Re-enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
