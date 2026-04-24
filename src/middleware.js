import { NextResponse } from 'next/server';

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // Protect the /admin route
  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      try {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        // Use environment variables or fallback to a default
        const expectedUser = process.env.ADMIN_USER || 'admin';
        const expectedPass = process.env.ADMIN_PASS || 'prosar2025';

        if (user === expectedUser && pwd === expectedPass) {
          return NextResponse.next();
        }
      } catch (e) {
        console.error('Auth header decoding failed', e);
      }
    }

    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Panel"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
