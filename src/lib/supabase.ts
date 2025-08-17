import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if env vars are missing (for build time)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://dummy.supabase.co', 'dummy-key');

// Helper function to check if current user is admin (server-side check)
export const isAdmin = async () => {
  try {
    console.log('isAdmin: Starting admin check...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Auth getUser timeout')), 5000)
    );
    
    const getUserPromise = supabase.auth.getUser();
    
    console.log('isAdmin: Getting user with timeout...');
    const { data: { user } } = await Promise.race([getUserPromise, timeoutPromise]);
    
    console.log('isAdmin: Got user result:', !!user, user?.email);
    
    if (!user?.email) {
      console.log('isAdmin: No user or email found');
      return false;
    }
    
    console.log('isAdmin: Checking admin status for user:', user.email);
    
    // Call server-side API to check admin status
    const response = await fetch('/api/auth/check-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });
    
    console.log('isAdmin: API response status:', response.status);
    
    if (!response.ok) {
      console.error('isAdmin: API returned non-200 status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('isAdmin: API response data:', data);
    
    return data.isAdmin || false;
  } catch (error) {
    console.error('isAdmin: Error checking admin status:', error);
    return false;
  }
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
