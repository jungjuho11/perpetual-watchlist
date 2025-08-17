import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if env vars are missing (for build time)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://dummy.supabase.co', 'dummy-key');

// Helper function to check if current user is admin (server-side check)
export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  
  // Call server-side API to check admin status
  try {
    console.log('Checking admin status for:', user.email);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Admin check timeout')), 10000)
    );
    
    const fetchPromise = fetch('/api/auth/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
    console.log('Admin check response status:', response.status);
    
    if (!response.ok) {
      console.error('Admin check API returned non-200 status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('Admin check response data:', data);
    
    return data.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
