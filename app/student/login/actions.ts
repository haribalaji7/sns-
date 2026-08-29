'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginStudent(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  if (supabaseUrl.includes('placeholder')) {
    // Mock login for demo purposes if Supabase is not configured
    redirect('/student/dashboard');
  }

  if (email === 'demo@campusshield.edu') {
    cookieStore.set('demo_student', 'true', { path: '/' });
    redirect('/student/dashboard');
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user is actually a student
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'student') {
    // Sign them out immediately if they aren't a student
    await supabase.auth.signOut();
    return { error: 'Unauthorized. This portal is for students only.' };
  }

  redirect('/student/dashboard');
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete('demo_student');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  if (!supabaseUrl.includes('placeholder')) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {}
        },
      },
    });
    await supabase.auth.signOut();
  }
  redirect('/student/login');
}
