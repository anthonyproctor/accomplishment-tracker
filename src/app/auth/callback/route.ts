import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const response = NextResponse.redirect(new URL(next, request.url))

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
                ...options,
                maxAge: 0,
              })
            },
          },
        }
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return response
      }
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  // Return to login if something went wrong
  return NextResponse.redirect(new URL('/login', request.url))
}
