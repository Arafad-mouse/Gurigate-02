// Test Supabase connection and RLS policies
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjhpdzmsfpkiewzibrtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODE5NDksImV4cCI6MjA4NzE1Nzk0OX0.xkmk-6rrFxolOjg7n50akB5IiN6hN5L_hADTbDyPBiU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can read properties table
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
        console.log('Sample property:', properties[0]);
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
    }

    // Test 3: Check for featured_properties table (should not exist or be empty)
    console.log('\n📊 Test 3: Checking featured_properties table...');
    const { data: featuredTable, error: featuredTableError } = await supabase
      .from('featured_properties')
      .select('*')
      .limit(5);
    
    if (featuredTableError) {
      console.log('ℹ️ featured_properties table error (expected):', featuredTableError.message);
    } else {
      console.log('⚠️ featured_properties table exists with', featuredTable?.length || 0, 'records');
    }

    // Test 4: Test city filters
    console.log('\n🏙️ Test 4: Testing city filters...');
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
      }
    }

    // Test 5: Check property detail by ID
    console.log('\n🏠 Test 5: Testing property detail...');
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
        console.log('Property detail keys:', Object.keys(propertyDetail || {}));
      }
    }

    // Test 6: Test anonymous user restrictions
    console.log('\n🔒 Test 6: Testing anonymous user restrictions...');
    
    // Try to create a wishlist item (should fail)
    const { data: wishlistInsert, error: wishlistError } = await supabase
      .from('wishlists')
      .insert({ property_id: properties?.[0]?.id, user_id: 'test-anonymous' })
      .select();
    
    if (wishlistError) {
      console.log('✅ Anonymous wishlist creation correctly blocked:', wishlistError.message);
    } else {
      console.log('⚠️ Anonymous wishlist creation allowed (security issue!)');
    }

    // Try to create a booking (should fail)
    const { data: bookingInsert, error: bookingError } = await supabase
      .from('bookings')
      .insert({ 
        property_id: properties?.[0]?.id, 
        user_id: 'test-anonymous',
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

testSupabaseConnection();
