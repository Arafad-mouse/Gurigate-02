import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjhpdzmsfpkiewzibrtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODE5NDksImV4cCI6MjA4NzE1Nzk0OX0.xkmk-6rrFxolOjg7n50akB5IiN6hN5L_hADTbDyPBiU';

const supabase = createClient(supabaseUrl, supabaseKey);

const propertiesData = [
  { id: 1, name: "New York", type: "House", size: "1400ft", status: "Sale", beds: 5, location: "France", price: "$250,00 USD", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=80" },
  { id: 2, name: "Washington Residence", type: "Villa", size: "1600ft", status: "Rent", beds: 3, location: "Canada", price: "$87,00 USD", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&q=80" },
  { id: 3, name: "London Residence", type: "House", size: "1600ft", status: "Rent", beds: 4, location: "England", price: "$200,00 USD", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=60&q=80" },
  { id: 4, name: "Grand Resort Villa", type: "Villa", size: "1600ft", status: "Sold", beds: 5, location: "Canada", price: "$350,00 USD", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=60&q=80" },
  { id: 5, name: "House Residence", type: "House", size: "1400ft", status: "Rent", beds: 3, location: "France", price: "$350,00 USD", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=60&q=80" },
  { id: 6, name: "Paris Square", type: "Villa", size: "1200ft", status: "Sold", beds: 3, location: "German", price: "$250,00 USD", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=60&q=80" },
  { id: 7, name: "Canada Residence", type: "Villa", size: "2400ft", status: "Rent", beds: 6, location: "Portugal", price: "$150,00 USD", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=60&q=80" },
  { id: 8, name: "Luxury Penthouse", type: "House", size: "2200ft", status: "Sale", beds: 6, location: "Thailand", price: "$540,00 USD", img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=60&q=80" },
  { id: 9, name: "Duplex Bungalow", type: "Bungalow", size: "2200ft", status: "Rent", beds: 6, location: "America", price: "$1500 USD", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=60&q=80" },
];

async function insertProperties() {
  try {
    console.log('Starting property insertion...');
    
    // Get current user (for owner_id)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      console.log('Note: Using a placeholder owner_id. You may need to update this with a real user ID.');
      // Use a placeholder UUID for testing
      var ownerId = '00000000-0000-0000-0000-000000000000';
    } else {
      var ownerId = user.id;
      console.log('Using authenticated user ID:', ownerId);
    }

    // Transform properties data to match database schema
    const transformedProperties = propertiesData.map(prop => {
      // Map property types to valid enum values
      const typeMap = {
        'house': 'house',
        'villa': 'villa',
        'apartment': 'apartment',
        'studio': 'studio',
        'condo': 'condo',
        'townhouse': 'townhouse',
        'cottage': 'townhouse', // Map cottage to townhouse
        'penthouse': 'penthouse',
        'loft': 'loft',
        'bungalow': 'house', // Map bungalow to house
        'other': 'other'
      };

      const propType = prop.type.toLowerCase();
      const mappedType = typeMap[propType] || 'other';

      return {
        owner_id: ownerId,
        title: prop.name,
        description: `Beautiful ${prop.type} located in ${prop.location}. Size: ${prop.size}.`,
        type: mappedType,
        status: 'active',
        is_approved: true,
        is_featured: false
      };
    });

    // Insert properties
    const { data, error } = await supabase
      .from('properties')
      .insert(transformedProperties)
      .select();

    if (error) {
      console.error('Error inserting properties:', error);
      return;
    }

    console.log(`Successfully inserted ${data.length} properties!`);
    console.log('Properties:', data);

    // Now insert related data (pricing, features, images)
    if (data && data.length > 0) {
      console.log('\nInserting property pricing...');
      
      const pricingData = data.map((prop, idx) => {
        const numericPrice = parseInt(propertiesData[idx].price.replace(/[^0-9]/g, "")) || 0;
        const pricingType = propertiesData[idx].status === 'Sale' ? 'sale' : 'nightly';
        
        return {
          property_id: prop.id,
          base_price: numericPrice,
          currency: 'USD',
          pricing_type: pricingType,
          security_deposit: 100,
          cleaning_fee: 50,
          service_fee: 10,
          created_at: new Date().toISOString()
        };
      });

      const { error: pricingError } = await supabase
        .from('property_pricing')
        .insert(pricingData);

      if (pricingError) {
        console.error('Error inserting pricing:', pricingError);
      } else {
        console.log('Successfully inserted property pricing!');
      }

      console.log('\nInserting property features...');
      
      const featuresData = data.map((prop, idx) => ({
        property_id: prop.id,
        bedrooms: propertiesData[idx].beds,
        bathrooms: Math.ceil(propertiesData[idx].beds / 2),
        max_guests: propertiesData[idx].beds * 2,
        square_feet: parseInt(propertiesData[idx].size.replace(/[^0-9]/g, "")) || 0,
        amenities: ['WiFi', 'Kitchen', 'Parking', 'Air Conditioning'],
        rules: ['No smoking', 'No pets', 'Quiet hours after 10 PM'],
        created_at: new Date().toISOString()
      }));

      const { error: featuresError } = await supabase
        .from('property_features')
        .insert(featuresData);

      if (featuresError) {
        console.error('Error inserting features:', featuresError);
      } else {
        console.log('Successfully inserted property features!');
      }

      console.log('\nInserting property images...');
      
      const imagesData = data.map((prop, idx) => ({
        property_id: prop.id,
        image_url: propertiesData[idx].img,
        alt_text: `${propertiesData[idx].name} - Primary Image`,
        sort_order: 0,
        is_primary: true,
        created_at: new Date().toISOString()
      }));

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imagesData);

      if (imagesError) {
        console.error('Error inserting images:', imagesError);
      } else {
        console.log('Successfully inserted property images!');
      }
    }

    console.log('\n✅ All data inserted successfully!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

insertProperties();
