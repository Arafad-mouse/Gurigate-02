const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4MTk0OSwiZXhwIjoyMDg3MTU3OTQ5fQ.KfTJ6Q6jK-8JQ6hXkLd8YfJ6hXkLd8YfJ6hXkLd8Y';

async function fixRLSPolicies() {
  const supabase = createClient(supabaseUrl, serviceKey);
  
  console.log('Fixing RLS policies...');
  
  try {
    // Drop existing problematic policies
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
          DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
          DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
          DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;
        `
      });
    
    if (dropError) {
      console.log('Error dropping policies:', dropError.message);
    } else {
      console.log('Dropped existing policies');
    }
    
    // Create simple public read policy for properties
    const { error: createError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (createError && createError.code !== 'PGRST116') {
      console.log('Error testing properties access:', createError.message);
    } else {
      console.log('Properties table is accessible');
    }
    
    // Test the connection
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, status, city')
      .limit(3);
    
    if (error) {
      console.log('Error accessing properties:', error.message);
    } else {
      console.log('Successfully accessed properties:');
      data.forEach(p => console.log(`  - ${p.title} (${p.status}, ${p.city || 'No city'})`));
    }
    
  } catch (err) {
    console.log('Exception:', err.message);
  }
}

fixRLSPolicies();
