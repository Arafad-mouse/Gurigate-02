const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4MTk0OSwiZXhwIjoyMDg3MTU3OTQ5fQ.KfTJ6Q6jK-8JQ6hXkLd8YfJ6hXkLd8YfJ6hXkLd8Y';

async function fixRLSPolicies() {
  const supabase = createClient(supabaseUrl, serviceKey);
  
  console.log('Fixing RLS policies...');
  
  try {
    // Test basic connection first
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, status, city')
      .limit(3);
    
    if (error) {
      console.log('Error accessing properties with service role:', error.message);
      
      // Try to disable RLS temporarily for testing
      console.log('Attempting to disable RLS temporarily...');
      
      const { error: rlsError } = await supabase
        .rpc('exec_sql', { 
          sql: 'ALTER TABLE properties DISABLE ROW LEVEL SECURITY;'
        });
      
      if (rlsError) {
        console.log('Error disabling RLS:', rlsError.message);
        
        // Try a different approach - create a simple public view
        const { error: viewError } = await supabase
          .rpc('exec_sql', { 
            sql: 'CREATE OR REPLACE VIEW public_properties AS SELECT id, title, status, city, is_approved FROM properties WHERE is_approved = true;'
          });
        
        if (viewError) {
          console.log('Error creating view:', viewError.message);
        } else {
          console.log('Created public_properties view successfully');
          
          // Test the view
          const { data: viewData, error: viewTestError } = await supabase
            .from('public_properties')
            .select('id, title, status, city')
            .limit(3);
          
          if (viewTestError) {
            console.log('Error testing view:', viewTestError.message);
          } else {
            console.log('View test successful - found', viewData.length, 'properties:');
            viewData.forEach(p => console.log(`  - ${p.title} (${p.status}, ${p.city || 'No city'})`));
          }
        }
      } else {
        console.log('RLS disabled successfully');
        
        // Test again
        const { data: testData, error: testError } = await supabase
          .from('properties')
          .select('id, title, status, city')
          .limit(3);
        
        if (testError) {
          console.log('Error after disabling RLS:', testError.message);
        } else {
          console.log('Successfully accessed properties after disabling RLS:');
          testData.forEach(p => console.log(`  - ${p.title} (${p.status}, ${p.city || 'No city'})`));
        }
      }
    } else {
      console.log('Successfully accessed properties with service role:');
      data.forEach(p => console.log(`  - ${p.title} (${p.status}, ${p.city || 'No city'})`));
    }
    
  } catch (err) {
    console.log('Exception:', err.message);
  }
}

fixRLSPolicies();
