import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. FAST PATH: Never intercept Next.js internal static assets, chunks, CSS, JS, fonts, images, or APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/models') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  // Demo Security Bypass
  if (request.cookies.get('demo_security')?.value === 'true') {
    // If they explicitly navigate to Student or Admin Login, clear the demo security session
    if (pathname.startsWith('/student/login') || pathname.startsWith('/admin/login')) {
      let response = NextResponse.next();
      response.cookies.delete('demo_security');
      return response;
    }

    // If they try to go to security login while already in demo security mode, send to dashboard
    if (pathname.startsWith('/security/login')) {
      return NextResponse.redirect(new URL('/security/dashboard', request.url));
    }

    // Prevent demo security officer from accessing student portal
    if (pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/security/dashboard', request.url));
    }

    return supabaseResponse;
  }

  // Demo Admin Bypass
  if (request.cookies.get('demo_admin')?.value === 'true') {
    // If they explicitly navigate to Student or Security Login, clear the demo admin session
    if (pathname.startsWith('/student/login') || pathname.startsWith('/security/login')) {
      let response = NextResponse.next();
      response.cookies.delete('demo_admin');
      return response;
    }
    
    // Prevent demo admin from accessing the Student Dashboard
    if (pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If they try to go to admin login while already in demo admin mode, send to dashboard
    if (pathname.startsWith('/admin/login')) {
       return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return supabaseResponse;
  }

  // Demo Student Bypass
  if (request.cookies.get('demo_student')?.value === 'true') {
    // If they explicitly navigate to Admin or Security Login, clear the demo session
    if (pathname.startsWith('/admin/login') || pathname.startsWith('/security/login')) {
      let response = NextResponse.next();
      response.cookies.delete('demo_student');
      return response;
    }
    
    // Prevent demo student from accessing the real Admin Dashboard or Security Portal
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/security')) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    
    // If they try to go to student login while already in demo mode, send to dashboard
    if (pathname.startsWith('/student/login')) {
       return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    
    return supabaseResponse;
  }

  // Prevent breaking in environments where Supabase is not configured yet
  if (supabaseUrl.includes('placeholder')) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute =
      pathname.startsWith('/admin/login') ||
      pathname.startsWith('/student/login') ||
      pathname.startsWith('/security/login');
    
    if (!user && !isAuthRoute && pathname !== '/') {
      // If they try to access security route, go to security login
      if (pathname.startsWith('/security')) {
        return NextResponse.redirect(new URL('/security/login', request.url));
      }
      // If they try to access student route, go to student login
      if (pathname.startsWith('/student')) {
        return NextResponse.redirect(new URL('/student/login', request.url));
      }
      // Otherwise fallback to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (user) {
      // Fetch user role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || 'viewer';

      // If logged in and on an auth route, redirect them to their dashboard
      if (isAuthRoute) {
        if (role === 'security') {
          return NextResponse.redirect(new URL('/security/dashboard', request.url));
        }
        if (role === 'student') {
          return NextResponse.redirect(new URL('/student/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Role-based protection
      if (pathname.startsWith('/security') && role !== 'security') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname.startsWith('/student') && role !== 'student') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname.startsWith('/dashboard') && role === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      if (pathname.startsWith('/dashboard') && role === 'security') {
        return NextResponse.redirect(new URL('/security/dashboard', request.url));
      }
    }
  } catch (err) {
    console.error('Middleware Supabase error:', err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, css, js, models, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot|pt|bin|json)$).*)',
  ],
};
