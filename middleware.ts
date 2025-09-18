import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Security headers
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP header for security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  )

  // Rate limiting for authentication endpoints
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // In a real application, you would implement proper rate limiting here
    // For now, we'll just add a delay to prevent brute force attacks
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Protect dashboard routes
  const protectedPaths = ['/admin', '/police', '/citizen', '/court', '/lawyer']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  if (token && isProtectedPath) {
    const userRole = token.role as string
    
    // Check if user has access to the requested path
    const roleAccess = {
      ADMIN: ['/admin'],
      POLICE: ['/police'],
      CITIZEN: ['/citizen'],
      JUDGE: ['/court'],
      COURT_STAFF: ['/court'],
      LAWYER: ['/lawyer']
    }

    const allowedPaths = roleAccess[userRole as keyof typeof roleAccess] || []
    const hasAccess = allowedPaths.some(path => pathname.startsWith(path))

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Audit logging for sensitive operations
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const method = request.method
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // In a real application, you would log this to your audit system
    console.log(`API Access: ${method} ${pathname} - IP: ${ip} - User-Agent: ${userAgent}`)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/api/(.*)',
    '/auth/(.*)',
    '/admin/(.*)',
    '/police/(.*)',
    '/citizen/(.*)',
    '/court/(.*)',
    '/lawyer/(.*)'
  ]
}