import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard']
const AUTH_PAGES = ['/login', '/signup']
const COOKIE_NAME = 'allostock_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get(COOKIE_NAME)?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p))

  if (isProtected) {
    if (!sessionId) {
      const url = new URL('/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // Verify session via Upstash REST (edge-compatible)
    try {
      const res = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/get/session:${sessionId}`,
        { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
      )
      const data = await res.json()
      if (!data.result) {
        const url = new URL('/login', request.url)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
    } catch {
      // Redis down — let through, page will handle gracefully
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && sessionId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
