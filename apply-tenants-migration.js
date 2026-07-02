import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjhpdzmsfpkiewzibrtr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODE5NDksImV4cCI6MjA4NzE1Nzk0OX0.xkmk-6rrFxolOjg7n50akB5IiN6hN5L_hADTbDyPBiU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyTenantsMigration() {
  try {
    console.log('Applying tenants table migration...');

    // Create tenants table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
        building_id TEXT,
        unit_id TEXT,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 0,
        payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Overdue')),
        lease_status TEXT NOT NULL DEFAULT 'active' CHECK (lease_status IN ('active', 'inactive', 'terminated')),
        next_due_date DATE NOT NULL,
        move_in_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.error('Error creating table:', tableError);
      // Try alternative approach - check if table exists first
      const { data: tables, error: checkError } = await supabase
        .from('tenants')
        .select('*')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Table does not exist, but we cannot create it via anon key.');
        console.log('Please apply the migration manually in Supabase dashboard:');
        console.log('1. Go to https://supabase.com/dashboard/project/hjhpdzmsfpkiewzibrtr/sql');
        console.log('2. Copy the contents of supabase/migrations/20260702_create_tenants_table.sql');
        console.log('3. Paste and execute it');
        return;
      }
    }

    // Create indexes
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);',
      'CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON public.tenants(building_id);',
      'CREATE INDEX IF NOT EXISTS idx_tenants_payment_status ON public.tenants(payment_status);',
      'CREATE INDEX IF NOT EXISTS idx_tenants_lease_status ON public.tenants(lease_status);',
      'CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants(created_at DESC);'
    ];

    for (const indexSQL of indexes) {
      await supabase.rpc('exec_sql', { sql: indexSQL });
    }

    // Enable RLS
    console.log('Enabling RLS...');
    await supabase.rpc('exec_sql', { sql: 'ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;' });

    // Create RLS policies
    console.log('Creating RLS policies...');
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Users can view their own tenants" 
       ON public.tenants FOR SELECT 
       USING (auth.uid() = owner_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can insert their own tenants" 
       ON public.tenants FOR INSERT 
       WITH CHECK (auth.uid() = owner_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can update their own tenants" 
       ON public.tenants FOR UPDATE 
       USING (auth.uid() = owner_id) 
       WITH CHECK (auth.uid() = owner_id);`,
      `CREATE POLICY IF NOT EXISTS "Users can delete their own tenants" 
       ON public.tenants FOR DELETE 
       USING (auth.uid() = owner_id);`
    ];

    for (const policySQL of policies) {
      await supabase.rpc('exec_sql', { sql: policySQL });
    }

    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\nPlease apply the migration manually in Supabase dashboard:');
    console.log('1. Go to https://supabase.com/dashboard/project/hjhpdzmsfpkiewzibrtr/sql');
    console.log('2. Copy the contents of supabase/migrations/20260702_create_tenants_table.sql');
    console.log('3. Paste and execute it');
  }
}

applyTenantsMigration();
