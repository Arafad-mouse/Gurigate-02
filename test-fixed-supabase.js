// Test Supabase connection after RLS fixes simulation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjhpdzmsfpkiewzibrtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODE5NDksImV4cCI6MjA4NzE1Nzk0OX0.xkmk-6rrFxolOjg7n50akB5IiN6hN5L_hADTbDyPBiU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFixedSupabase() {
  console.log('🔍 Testing Supabase connection after RLS fixes...');
  
  try {
    // Test 1: Check if we can read properties table (should work now)
    console.log('\n📋 Test 1: Reading properties table...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);
    
    if (propertiesError) {
      console.error('❌ Properties read error:', propertiesError);
    } else {
      console.log('✅ Properties read successfully:', properties?.length || 0, 'records');
      if (properties && properties.length > 0) {
        console.log('Sample property:', {
          id: properties[0].id,
          title: properties[0].title,
          city: properties[0].city,
          is_featured: properties[0].is_featured,
          is_approved: properties[0].is_approved,
          status: properties[0].status
        });
      }
    }

    // Test 2: Check for featured properties using is_featured flag
    console.log('\n⭐ Test 2: Reading featured properties...');
    const { data: featuredProperties, error: featuredError } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .limit(5);
    
    if (featuredError) {
      console.error('❌ Featured properties read error:', featuredError);
    } else {
      console.log('✅ Featured properties read successfully:', featuredProperties?.length || 0, 'records');
      if (featuredProperties && featuredProperties.length > 0) {
        console.log('Sample featured property:', {
          id: featuredProperties[0].id,
          title: featuredProperties[0].title,
          is_featured: featuredProperties[0].is_featured
        });
      }
    }

    // Test 3: Test city filters
    console.log('\n🏙️ Test 3: Testing city filters...');
    const cities = ['Hargeisa', 'Nairobi', 'Mogadishu'];
    
    for (const city of cities) {
      const { data: cityProperties, error: cityError } = await supabase
        .from('properties')
        .select('*')
        .eq('city', city)
        .limit(3);
      
      if (cityError) {
        console.error(`❌ ${city} properties error:`, cityError);
      } else {
        console.log(`✅ ${city} properties:`, cityProperties?.length || 0, 'records');
        if (cityProperties && cityProperties.length > 0) {
          console.log(`  Sample ${city} property:`, cityProperties[0].title);
        }
      }
    }

    // Test 4: Check property detail by ID
    console.log('\n🏠 Test 4: Testing property detail...');
    if (properties && properties.length > 0) {
      const { data: propertyDetail, error: detailError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', properties[0].id)
        .single();
      
      if (detailError) {
        console.error('❌ Property detail error:', detailError);
      } else {
        console.log('✅ Property detail read successfully');
        console.log('Property detail:', {
          id: propertyDetail.id,
          title: propertyDetail.title,
          description: propertyDetail.description?.substring(0, 100) + '...',
          city: propertyDetail.city,
          type: propertyDetail.type,
          status: propertyDetail.status,
          is_featured: propertyDetail.is_featured
        });
      }
    }

    // Test 5: Test related tables (addresses, pricing, features)
    console.log('\n📊 Test 5: Testing related tables...');
    if (properties && properties.length > 0) {
      const propertyId = properties[0].id;
      
      // Test addresses
      const { data: addresses, error: addressError } = await supabase
        .from('property_addresses')
        .select('*')
        .eq('property_id', propertyId);
      
      if (addressError) {
        console.error('❌ Address read error:', addressError);
      } else {
        console.log('✅ Property addresses:', addresses?.length || 0, 'records');
      }

      // Test pricing
      const { data: pricing, error: pricingError } = await supabase
        .from('property_pricing')
        .select('*')
        .eq('property_id', propertyId);
      
      if (pricingError) {
        console.error('❌ Pricing read error:', pricingError);
      } else {
        console.log('✅ Property pricing:', pricing?.length || 0, 'records');
      }

      // Test features
      const { data: features, error: featuresError } = await supabase
        .from('property_features')
        .select('*')
        .eq('property_id', propertyId);
      
      if (featuresError) {
        console.error('❌ Features read error:', featuresError);
      } else {
        console.log('✅ Property features:', features?.length || 0, 'records');
      }
    }

    // Test 6: Test anonymous user restrictions
    console.log('\n🔒 Test 6: Testing anonymous user restrictions...');
    
    // Try to create a wishlist item (should fail for anon)
    const { data: wishlistInsert, error: wishlistError } = await supabase
      .from('wishlists')
      .insert({ 
        property_id: properties?.[0]?.id, 
        user_id: '00000000-0000-0000-0000-000000000000' // Invalid UUID for anon test
      })
      .select();
    
    if (wishlistError) {
      console.log('✅ Anonymous wishlist creation correctly blocked:', wishlistError.message);
    } else {
      console.log('⚠️ Anonymous wishlist creation allowed (security issue!)');
    }

    // Try to create a booking (should fail for anon)
    const { data: bookingInsert, error: bookingError } = await supabase
      .from('property_bookings')
      .insert({ 
        property_id: properties?.[0]?.id, 
        guest_id: '00000000-0000-0000-0000-000000000000',
        start_date: '2026-05-01',
        end_date: '2026-05-02'
      })
      .select();
    
    if (bookingError) {
      console.log('✅ Anonymous booking creation correctly blocked:', bookingError.message);
    } else {
      console.log('⚠️ Anonymous booking creation allowed (security issue!)');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testFixedSupabase();
