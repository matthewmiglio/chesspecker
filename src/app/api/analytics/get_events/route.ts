import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import type { Session } from 'next-auth';

interface ExtendedSession extends Session {
  supabase?: {
    access_token: string;
    user_id: string | null;
    expires_at: number | undefined;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function GET() {
  console.log('[get_events] Starting analytics events request');

  try {
    const session = await getServerSession(authOptions);
    const extendedSession = session as ExtendedSession;

    console.log('[get_events] Session obtained with authOptions:', {
      hasSession: !!session,
      userEmail: session?.user?.email || 'none',
      userName: session?.user?.name || 'none',
      hasSupabaseData: !!extendedSession?.supabase,
      supabaseUserId: extendedSession?.supabase?.user_id || 'none',
      supabaseTokenLength: extendedSession?.supabase?.access_token?.length || 0,
      fullSession: session
    });

    if (!session?.user?.email) {
      console.log('[get_events] Unauthorized: No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    console.log('[get_events] Admin email check:', {
      adminEmail: adminEmail,
      userEmail: session.user.email,
      isMatch: session.user.email === adminEmail
    });

    if (!adminEmail || session.user.email !== adminEmail) {
      console.log('[get_events] Forbidden: User is not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('[get_events] Authorized admin access. Querying Supabase...');

    // Try using the Supabase JWT if available
    const supabaseToken = extendedSession?.supabase?.access_token;
    let supabaseClient = supabase;

    if (supabaseToken) {
      console.log('[get_events] Using Supabase JWT for authenticated request');
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseToken}`
            }
          }
        }
      );
    } else {
      console.log('[get_events] No Supabase JWT available, using anon key');
    }

    console.log('[get_events] Making Supabase query with:', {
      hasSupabaseToken: !!supabaseToken,
      tokenLength: supabaseToken?.length || 0,
      usingAuthHeaders: !!supabaseToken
    });

    const { data, error } = await supabaseClient
      .from('chesspecker_analytics_events')
      .select('*')
      .order('ts', { ascending: false })
      .limit(1000);

    console.log('[get_events] Supabase query result:', {
      hasError: !!error,
      errorMessage: error?.message || 'none',
      errorDetails: error?.details || 'none',
      errorHint: error?.hint || 'none',
      errorCode: error?.code || 'none',
      dataCount: data?.length || 0,
      sampleEvent: data?.[0] || null
    });

    if (error) {
      console.error('[get_events] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[get_events] Success! Returning', data?.length || 0, 'events');
    return NextResponse.json({ events: data }, { status: 200 });

  } catch (err: unknown) {
    console.error('[get_events] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}