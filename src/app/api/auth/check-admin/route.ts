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
      adminEmail = 'jungjuho@yahoo.com'; // Your email as fallback
    }
    
    const isAdmin = email === adminEmail;
    
    const response = NextResponse.json({ isAdmin });
    
    // Prevent caching of admin status
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error checking admin status:', error);
    const errorResponse = NextResponse.json({ isAdmin: false }, { status: 500 });
    
    // Prevent caching of error responses too
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}
