import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isStudentRoute = pathname.startsWith('/student')

  // Защита приватных роутов
  if (!user && (isDashboardRoute || isStudentRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const [{ data: tutorSettings }, { data: studentRow }] = await Promise.all([
      supabase
        .from('tutor_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('students')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle(),
    ])

    const isTutor = Boolean(tutorSettings)
    const isStudent = Boolean(studentRow)

    if (pathname === '/login') {
      if (isTutor) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (isStudent) {
        return NextResponse.redirect(new URL('/student/homework', request.url))
      }
    }

    if (isDashboardRoute && !isTutor) {
      return NextResponse.redirect(new URL('/student/homework', request.url))
    }

    if (isStudentRoute && !isStudent) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/student/:path*', '/login'],
}
