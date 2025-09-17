import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function GET(req: Request) {
  console.log('[get_events] Starting analytics events request');

  try {
    const session = await getServerSession();
    console.log('[get_events] Session obtained:', {
      hasSession: !!session,
      userEmail: session?.user?.email || 'none',
      userName: session?.user?.name || 'none'
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

    const { data, error } = await supabase
      .from('chesspecker_analytics_events')
      .select('*')
      .order('ts', { ascending: false })
      .limit(1000);

    console.log('[get_events] Supabase query result:', {
      hasError: !!error,
      errorMessage: error?.message || 'none',
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