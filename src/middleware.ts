import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/account', '/checkout'];

export function middleware(req: NextRequest) {
  const token    = req.cookies.get('gng_access_token')?.value;
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*'],
};