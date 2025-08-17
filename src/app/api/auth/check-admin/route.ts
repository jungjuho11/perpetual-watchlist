import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }
    
    // Check against server-side admin email (not exposed to client)
    const adminEmail = process.env.ADMIN_EMAIL; // Note: NO NEXT_PUBLIC_ prefix
    const isAdmin = email === adminEmail;
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
