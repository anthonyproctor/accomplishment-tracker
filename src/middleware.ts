import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            httpOnly: true,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            path: options.path,
            maxAge: 0,
          })
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Auth pages are only accessible when not logged in
    if (session && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protected pages require authentication
    if (!session && !['/login', '/signup'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Update config to exclude root path and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (root path)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$).*)',
  ],
}
