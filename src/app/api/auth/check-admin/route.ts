import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }
    
    // Check against server-side admin email (not exposed to client)
    let adminEmail = process.env.ADMIN_EMAIL; // Note: NO NEXT_PUBLIC_ prefix
    
    // Fallback for development or if ADMIN_EMAIL is not set
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL environment variable is not set, using fallback');
      adminEmail = 'jungjuho@yahoo.com'; // Your email as fallback
    }
    
    // Debug logging (remove this in production)
    console.log('Admin check - Email received:', email);
    console.log('Admin check - Admin email configured:', adminEmail ? 'Yes' : 'No');
    
    const isAdmin = email === adminEmail;
    console.log('Admin check result:', isAdmin);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
