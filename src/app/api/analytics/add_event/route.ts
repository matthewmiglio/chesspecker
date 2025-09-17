import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'edge';

export async function POST(req: Request) {

  try {
    const body = await req.json();

    const { path, referrer, visitor_id, session_id, ua } = body;

    const clientIP = getClientIP(req);

    const location = getLocationFromHeaders(req);

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Headers available:', {
        city: req.headers.get('x-vercel-ip-city'),
        state: req.headers.get('x-vercel-ip-country-region'),
        country: req.headers.get('x-vercel-ip-country'),
        ip: clientIP
      });
    }

    const ipHash = clientIP ? await hashIP(clientIP) : null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );

    const eventData = {
      path: path || '/',
      referrer: referrer || null,
      visitor_id: visitor_id || null,
      session_id: session_id || null,
      ua: ua || null,
      ip_hash: ipHash,
      city: location.city,
      state: location.state,
      country: location.country,
    };

    const { error } = await supabase
      .from('chesspecker_analytics_events')
      .insert([eventData]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: eventData }, { status: 200 });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

function getClientIP(req: Request): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return null;
}

function getLocationFromHeaders(req: Request) {
  const city = req.headers.get('x-vercel-ip-city');
  const state = req.headers.get('x-vercel-ip-country-region');
  const country = req.headers.get('x-vercel-ip-country');

  return {
    city: city ? decodeURIComponent(city) : null,
    state: state ? decodeURIComponent(state) : null,
    country: country ? decodeURIComponent(country) : null,
  };
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_HASH_SALT || 'default-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}