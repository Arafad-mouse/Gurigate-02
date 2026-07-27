import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data
const profiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Ahmed Hassan',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'host'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Fatima Ali',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'host'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Mohamed Ibrahim',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'host'
  }
];

const properties = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Modern Penthouse in Hargeisa',
    description: 'Luxurious penthouse with stunning city views and modern amenities. Perfect for business travelers and couples seeking comfort and style.',
    type: 'apartment',
    property_category: 'residential',
    listing_type: 'short_stay',
    approval_status: 'approved',
    status: 'available',
    is_featured: true,
    owner_id: '00000000-0000-0000-0000-000000000001',
    view_count: 128
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Garden Oasis Villa',
    description: 'Beautiful villa with private garden, swimming pool, and spacious living areas. Ideal for families and longer stays.',
    type: 'villa',
    property_category: 'residential',
    listing_type: 'short_stay',
    approval_status: 'approved',
    status: 'available',
    is_featured: true,
    owner_id: '00000000-0000-0000-0000-000000000001',
    view_count: 95
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Downtown Hargeisa Apartment',
    description: 'Modern apartment in the heart of Hargeisa with easy access to markets, restaurants, and business centers.',
    type: 'apartment',
    property_category: 'residential',
    listing_type: 'long_rent',
    approval_status: 'approved',
    status: 'available',
    is_featured: false,
    owner_id: '00000000-0000-0000-0000-000000000001',
    view_count: 67
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Beachfront Studio Berbera',
    description: 'Cozy studio apartment just steps from the beach with ocean views and modern amenities.',
    type: 'studio',
    property_category: 'residential',
    listing_type: 'short_stay',
    approval_status: 'approved',
    status: 'available',
    is_featured: true,
    owner_id: '00000000-0000-0000-0000-000000000002',
    view_count: 142
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Berbera Port House',
    description: 'Spacious house near the port with traditional Somali architecture and modern comforts.',
    type: 'house',
    property_category: 'residential',
    listing_type: 'sale',
    approval_status: 'approved',
    status: 'available',
    is_featured: false,
    owner_id: '00000000-0000-0000-0000-000000000002',
    view_count: 88
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    title: 'Borama Countryside Villa',
    description: 'Elegant villa surrounded by beautiful countryside, perfect for those seeking peace and tranquility.',
    type: 'villa',
    property_category: 'residential',
    listing_type: 'long_rent',
    approval_status: 'approved',
    status: 'available',
    is_featured: true,
    owner_id: '00000000-0000-0000-0000-000000000003',
    view_count: 76
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    title: 'Modern Borama Apartment',
    description: 'Contemporary apartment with all modern amenities in the growing city of Borama.',
    type: 'apartment',
    property_category: 'residential',
    listing_type: 'short_stay',
    approval_status: 'approved',
    status: 'available',
    is_featured: false,
    owner_id: '00000000-0000-0000-0000-000000000003',
    view_count: 54
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    title: 'Skyper Pool Apartment',
    description: 'Modern apartment with pool access and city views in upscale Nairobi neighborhood.',
    type: 'apartment',
    property_category: 'residential',
    listing_type: 'sale',
    approval_status: 'approved',
    status: 'available',
    is_featured: true,
    owner_id: '00000000-0000-0000-0000-000000000001',
    view_count: 203
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    title: 'Karen Garden Villa',
    description: 'Luxurious villa in prestigious Karen area with beautiful gardens and security.',
    type: 'villa',
    property_category: 'residential',
    listing_type: 'short_stay',
    approval_status: 'approved',
    status: 'available',
    is_featured: true,
    owner_id: '00000000-0000-0000-0000-000000000002',
    view_count: 187
  },
  {
    id: '10000000-0000-0000-0000-000000000010',
    title: 'Westlands Modern Studio',
    description: 'Sleek studio apartment in Westlands with modern finishes and great amenities.',
    type: 'studio',
    property_category: 'residential',
    listing_type: 'long_rent',
    approval_status: 'approved',
    status: 'available',
    is_featured: false,
    owner_id: '00000000-0000-0000-0000-000000000003',
    view_count: 45
  }
];

const addresses = [
  { property_id: '10000000-0000-0000-0000-000000000001', street: 'Sheikh Nur Street', apartment: 'Penthouse A', city: 'Hargeisa', state: 'Maroodi Jeex', postal_code: 'SL1 001', country: 'Somalia', latitude: 9.5600, longitude: 44.0650, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000002', street: 'Garden District Road', apartment: null, city: 'Hargeisa', state: 'Maroodi Jeex', postal_code: 'SL1 002', country: 'Somalia', latitude: 9.5500, longitude: 44.0750, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000003', street: 'Main Street', apartment: 'Apt 4B', city: 'Hargeisa', state: 'Maroodi Jeex', postal_code: 'SL1 003', country: 'Somalia', latitude: 9.5650, longitude: 44.0550, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000004', street: 'Beach Road', apartment: 'Studio 1', city: 'Berbera', state: 'Sahil', postal_code: 'SL2 001', country: 'Somalia', latitude: 10.4167, longitude: 45.0167, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000005', street: 'Port Avenue', apartment: null, city: 'Berbera', state: 'Sahil', postal_code: 'SL2 002', country: 'Somalia', latitude: 10.4267, longitude: 45.0267, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000006', street: 'Countryside Lane', apartment: null, city: 'Borama', state: 'Awdal', postal_code: 'SL3 001', country: 'Somalia', latitude: 10.0667, longitude: 43.1667, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000007', street: 'Modern Street', apartment: 'Apt 2C', city: 'Borama', state: 'Awdal', postal_code: 'SL3 002', country: 'Somalia', latitude: 10.0767, longitude: 43.1767, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000008', street: 'Westlands Road', apartment: 'Penthouse B', city: 'Nairobi', state: 'Nairobi County', postal_code: '00100', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000009', street: 'Karen Lane', apartment: null, city: 'Nairobi', state: 'Nairobi County', postal_code: '00200', country: 'Kenya', latitude: -1.3121, longitude: 36.8419, show_precise_location: true },
  { property_id: '10000000-0000-0000-0000-000000000010', street: 'Parklands Road', apartment: 'Studio 5', city: 'Nairobi', state: 'Nairobi County', postal_code: '00300', country: 'Kenya', latitude: -1.2621, longitude: 36.8019, show_precise_location: true }
];

const images = [
  { property_id: '10000000-0000-0000-0000-000000000001', url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000001', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', is_primary: false, sort_order: 2 },
  { property_id: '10000000-0000-0000-0000-000000000001', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', is_primary: false, sort_order: 3 },
  { property_id: '10000000-0000-0000-0000-000000000002', url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000002', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', is_primary: false, sort_order: 2 },
  { property_id: '10000000-0000-0000-0000-000000000003', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000004', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000004', url: 'https://images.unsplash.com/photo-1600210492486-8cc7c9e0c7f1?w=800&q=80', is_primary: false, sort_order: 2 },
  { property_id: '10000000-0000-0000-0000-000000000005', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000006', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000006', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', is_primary: false, sort_order: 2 },
  { property_id: '10000000-0000-0000-0000-000000000007', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000008', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000008', url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', is_primary: false, sort_order: 2 },
  { property_id: '10000000-0000-0000-0000-000000000009', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', is_primary: true, sort_order: 1 },
  { property_id: '10000000-0000-0000-0000-000000000009', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', is_primary: false, sort_order: 2 },
  { property_id: '10000000-0000-0000-0000-000000000010', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', is_primary: true, sort_order: 1 }
];

const pricing = [
  { property_id: '10000000-0000-0000-0000-000000000001', base_price: 120.00, currency: 'USD', pricing_type: 'nightly', security_deposit: 200.00, cleaning_fee: 50.00, service_fee: 15.00 },
  { property_id: '10000000-0000-0000-0000-000000000002', base_price: 245.00, currency: 'USD', pricing_type: 'nightly', security_deposit: 400.00, cleaning_fee: 75.00, service_fee: 25.00 },
  { property_id: '10000000-0000-0000-0000-000000000003', base_price: 850.00, currency: 'USD', pricing_type: 'monthly', security_deposit: null, cleaning_fee: null, service_fee: null },
  { property_id: '10000000-0000-0000-0000-000000000004', base_price: 95.00, currency: 'USD', pricing_type: 'nightly', security_deposit: 150.00, cleaning_fee: 40.00, service_fee: 12.00 },
  { property_id: '10000000-0000-0000-0000-000000000005', base_price: 180000.00, currency: 'USD', pricing_type: 'total', security_deposit: null, cleaning_fee: null, service_fee: null },
  { property_id: '10000000-0000-0000-0000-000000000006', base_price: 750.00, currency: 'USD', pricing_type: 'monthly', security_deposit: null, cleaning_fee: null, service_fee: null },
  { property_id: '10000000-0000-0000-0000-000000000007', base_price: 110.00, currency: 'USD', pricing_type: 'nightly', security_deposit: 180.00, cleaning_fee: 45.00, service_fee: 14.00 },
  { property_id: '10000000-0000-0000-0000-000000000008', base_price: 280000.00, currency: 'USD', pricing_type: 'total', security_deposit: null, cleaning_fee: null, service_fee: null },
  { property_id: '10000000-0000-0000-0000-000000000009', base_price: 320.00, currency: 'USD', pricing_type: 'nightly', security_deposit: 500.00, cleaning_fee: 80.00, service_fee: 30.00 },
  { property_id: '10000000-0000-0000-0000-000000000010', base_price: 650.00, currency: 'USD', pricing_type: 'monthly', security_deposit: null, cleaning_fee: null, service_fee: null }
];

const bathrooms = [
  { property_id: '10000000-0000-0000-0000-000000000001', private_attached: 2, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000002', private_attached: 3, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000003', private_attached: 1, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000004', private_attached: 1, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000005', private_attached: 2, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000006', private_attached: 3, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000007', private_attached: 1, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000008', private_attached: 2, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000009', private_attached: 3, dedicated: 0, shared: 0 },
  { property_id: '10000000-0000-0000-0000-000000000010', private_attached: 1, dedicated: 0, shared: 0 }
];

const features = [
  { property_id: '10000000-0000-0000-0000-000000000001', bedrooms: 3, beds: 3, max_guests: 4, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'TV', 'Workspace', 'Elevator', 'Balcony'], rules: ['No smoking', 'No pets'] },
  { property_id: '10000000-0000-0000-0000-000000000002', bedrooms: 5, beds: 5, max_guests: 10, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Garden', 'Gym', 'Laundry'], rules: ['No smoking', 'Check-in after 2pm'] },
  { property_id: '10000000-0000-0000-0000-000000000003', bedrooms: 2, beds: 2, max_guests: 3, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace'], rules: ['No smoking'] },
  { property_id: '10000000-0000-0000-0000-000000000004', bedrooms: 1, beds: 1, max_guests: 2, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Beach Access'], rules: ['No smoking'] },
  { property_id: '10000000-0000-0000-0000-000000000005', bedrooms: 4, beds: 4, max_guests: 8, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Laundry'], rules: ['No smoking', 'No pets'] },
  { property_id: '10000000-0000-0000-0000-000000000006', bedrooms: 4, beds: 4, max_guests: 8, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Gym', 'Security System'], rules: ['No smoking'] },
  { property_id: '10000000-0000-0000-0000-000000000007', bedrooms: 2, beds: 2, max_guests: 4, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace', 'Elevator'], rules: ['No smoking'] },
  { property_id: '10000000-0000-0000-0000-000000000008', bedrooms: 4, beds: 4, max_guests: 6, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Laundry', 'Security System'], rules: ['No smoking', 'No pets'] },
  { property_id: '10000000-0000-0000-0000-000000000009', bedrooms: 5, beds: 5, max_guests: 10, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'Pool', 'Gym', 'Security System'], rules: ['No smoking', 'No pets', 'Check-in after 3pm'] },
  { property_id: '10000000-0000-0000-0000-000000000010', bedrooms: 1, beds: 1, max_guests: 2, amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Workspace'], rules: ['No smoking'] }
];

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // Insert profiles
    console.log('Inserting profiles...');
    for (const profile of profiles) {
      const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
      if (error) console.error('Error inserting profile:', profile.id, error);
    }
    console.log('Profiles inserted successfully');

    // Insert properties
    console.log('Inserting properties...');
    for (const property of properties) {
      const { error } = await supabase.from('properties').upsert(property, { onConflict: 'id' });
      if (error) console.error('Error inserting property:', property.id, error);
    }
    console.log('Properties inserted successfully');

    // Insert images
    console.log('Inserting images...');
    for (const image of images) {
      const { error } = await supabase.from('property_images').insert(image);
      if (error) console.error('Error inserting image for property:', image.property_id, error);
    }
    console.log('Images inserted successfully');

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
