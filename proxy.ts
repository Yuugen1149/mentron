import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/lib/config/auth'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Check for Remember Me preference
    const rememberMe = request.cookies.get(AUTH_CONFIG.REMEMBER_ME_COOKIE)
    const isPersistent = rememberMe?.value === 'true'

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const cookieOptions = { ...options }

                        // Enforce Persistent Session (Always On)
                        // User requested login to stay until manual logout.
                        // We ensure maxAge is always set to the persistent duration.
                        cookieOptions.maxAge = AUTH_CONFIG.PERSISTENT_SESSION_DURATION;
                        cookieOptions.expires = new Date(Date.now() + AUTH_CONFIG.PERSISTENT_SESSION_DURATION * 1000);

                        // Allow testing on HTTP in development
                        if (process.env.NODE_ENV === 'development') {
                            cookieOptions.secure = false;
                        }

                        request.cookies.set(name, value)
                        response.cookies.set(name, value, cookieOptions)
                    })
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes logic
    const path = request.nextUrl.pathname
    const isDashboard = path.startsWith('/execom') || path.startsWith('/chairman') || path.startsWith('/student')
    const isAuthPage = path.startsWith('/login') || path.startsWith('/register')

    if (isDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthPage && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
