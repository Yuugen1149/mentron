import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Check for Remember Me preference
    const rememberMe = request.cookies.get('mentron-remember-me')
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

                        // If not persistent, remove maxAge and expires for auth cookies
                        // This makes them Session Cookies (cleared on browser close)
                        if (!isPersistent) {
                            delete cookieOptions.maxAge
                            delete cookieOptions.expires
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
        // Optional: Redirect strictly if already logged in?
        // For now, let the page handle it or redirect to /
        // Check user metadata/table to know where to go? 
        // We'll skip strict redirect here to avoid loops, or implement simpler check.
        // But let's keep it simple: if trying to access login while logged in, maybe go to home.
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
