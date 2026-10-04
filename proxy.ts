import { jwtDecode } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/about', '/services', '/contact', '/faq', '/hospitals', '/login', '/register', '/payment']
const authRoutes = ['/login', '/register']
const patientRoutes = ['/dashboard']
const driverRoutes = ['/driver']
const adminRoutes = ['/admin']

function decodeToken(token: string): { role?: string } | null {
  try {
    // Token is JWT, we can peek at the payload without verification
    // since we're just reading the role claim which is public info
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload
  } catch {
    return null
  }
}

function getRoutePrefix(path: string): string {
  if (patientRoutes.some((r) => path.startsWith(r))) return 'patient'
  if (driverRoutes.some((r) => path.startsWith(r))) return 'driver'
  if (adminRoutes.some((r) => path.startsWith(r))) return 'admin'
  if (authRoutes.some((r) => path === r)) return 'auth'
  if (publicRoutes.some((r) => path === r || path.startsWith(r))) return 'public'
  return 'unknown'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const routePrefix = getRoutePrefix(pathname)

  // Public routes
  if (routePrefix === 'public') {
    return NextResponse.next()
  }

  // Payment callback routes
  if (pathname.startsWith('/payment/')) {
    return NextResponse.next()
  }

  // Not found route
  if (pathname === '/not-found') {
    return NextResponse.next()
  }

  // No token: redirect to login (except public and auth routes)
  if (!accessToken) {
    if (authRoutes.includes(pathname)) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Has token: can't access auth routes
  if (authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Decode token to check role
  const decoded = decodeToken(accessToken)
  const role = decoded?.role as string | undefined

  if (!role) {
    // Token invalid, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')
    return response
  }

  // Role-based routing
  if (patientRoutes.some((r) => pathname.startsWith(r)) && role !== 'PATIENT') {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url))
  }
  if (driverRoutes.some((r) => pathname.startsWith(r)) && role !== 'DRIVER') {
    return NextResponse.redirect(new URL(`/${role === 'ADMIN' ? 'admin' : 'dashboard'}`, request.url))
  }
  if (adminRoutes.some((r) => pathname.startsWith(r)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${role === 'DRIVER' ? 'driver' : 'dashboard'}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
