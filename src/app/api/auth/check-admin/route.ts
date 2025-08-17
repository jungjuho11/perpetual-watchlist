import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }
    
    // Check against server-side admin email (not exposed to client)
    const adminEmail = process.env.ADMIN_EMAIL; // Note: NO NEXT_PUBLIC_ prefix
    
    // Debug logging (remove this in production)
    console.log('Admin check - Email received:', email);
    console.log('Admin check - Admin email from env:', adminEmail ? 'Set' : 'Not set');
    
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL environment variable is not set');
      return NextResponse.json({ isAdmin: false, error: 'Admin email not configured' });
    }
    
    const isAdmin = email === adminEmail;
    console.log('Admin check result:', isAdmin);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
