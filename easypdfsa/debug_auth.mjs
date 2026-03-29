import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

async function check() {
  const envContent = await readFile('.env.local', 'utf-8');
  const env = Object.fromEntries(
    envContent
      .split('\n')
      .map(line => line.split('='))
      .filter(parts => parts.length === 2)
  );

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const email = 'razimuhammedmrc@gmail.com';
  
  console.log('--- Checking User:', email, '---');
  const { data: authResult, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
     console.error('Auth error:', authErr);
     return;
  }
  
  const user = authResult.users.find(u => u.email === email);
  if (!user) {
    console.log('User NOT found in auth.users');
  } else {
    console.log('User found in auth.users!');
    console.log('User ID:', user.id);
    console.log('Email Confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
    
    console.log('\n--- Checking profiles table ---');
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profErr) {
       console.error('Profile error:', profErr);
    } else {
       console.log('Profile Role:', profile.role);
    }
    
    // Attempting a bypass fix: Explicitly confirm email and role if missing
    if (!user.email_confirmed_at) {
       console.log('\n--- Attempting to confirm email for user ---');
       await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
       console.log('Email confirmed!');
    }
    
    if (!profile || profile.role !== 'admin') {
       console.log('\n--- Attempting to set role as admin for profile ---');
       await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: 'admin' });
       console.log('Profile role set to admin!');
    }
  }
}

check();
