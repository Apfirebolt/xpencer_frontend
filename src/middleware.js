import { NextResponse } from 'next/server';

export function middleware(request) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  // 1. If maintenance mode is OFF, let requests pass through normally
  if (!isMaintenanceMode) {
    return NextResponse.next();
  }

  console.log('Maintenance mode is ON', process.env.MAINTENANCE_MODE);

  // 2. Allow requests to the maintenance page itself to avoid an infinite loop
  if (pathname.startsWith('/maintenance')) {
    return NextResponse.next();
  }

  // 3. Allow Next.js internal static assets, images, and favicons to load correctly
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Rewrite all other routes to show the maintenance page content
  return NextResponse.rewrite(new URL('/maintenance', request.url));
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};