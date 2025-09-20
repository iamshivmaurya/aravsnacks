import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API & Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
  }

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/settings`);
    const maintenanceMode =
      res.data.maintenanceMode === true || res.data.maintenanceMode === 'True';

    const response = NextResponse.next();

    // ✅ Always sync cookie
    response.cookies.set('maintenanceMode', maintenanceMode ? 'true' : 'false', {
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Middleware error:', err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
