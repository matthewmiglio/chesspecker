import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod';

// Validation schema for analytics event
const analyticsEventSchema = z.object({
  path: z.string().max(500, "Path too long").optional().default("/"),
  referrer: z.string().max(500, "Referrer too long").nullable().optional(),
  visitor_id: z.string().max(100, "Visitor ID too long").nullable().optional(),
  session_id: z.string().max(100, "Session ID too long").nullable().optional(),
  ua: z.string().max(500, "User agent too long").nullable().optional(),
});

export const runtime = 'edge';

export async function POST(req: Request) {
  console.log('[API POST /analytics/add_event] Request received');

  try {
    // Rate limiting: 100 requests per minute per IP
    const { analyticsLimiter, getClientIdentifier } = await import('@/lib/rateLimit');
    const identifier = getClientIdentifier(req);
    console.log('[API POST /analytics/add_event] Client identifier:', identifier);
    const { success, limit, remaining, reset } = await analyticsLimiter.limit(identifier);

    if (!success) {
      console.warn('[API POST /analytics/add_event] Rate limit exceeded:', { identifier, limit, remaining, reset });
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    const body = await req.json();
    console.log('[API POST /analytics/add_event] Request body:', body);

    // Validate input with Zod
    const validation = analyticsEventSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      console.error('[API POST /analytics/add_event] Validation error:', {
        error: firstError.message,
        path: firstError.path,
        received: body
      });
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { path, referrer, visitor_id, session_id, ua } = validation.data;
    console.log('[API POST /analytics/add_event] Validated data:', { path, visitor_id, session_id });

    const clientIP = getClientIP(req);
    console.log('[API POST /analytics/add_event] Client IP:', clientIP);

    const location = getLocationFromHeaders(req);
    console.log('[API POST /analytics/add_event] Location data:', location);

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
    console.log('[API POST /analytics/add_event] IP hash generated:', !!ipHash);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );
    console.log('[API POST /analytics/add_event] Supabase client created, URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

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
    console.log('[API POST /analytics/add_event] Event data prepared:', eventData);

    const { error } = await supabase
      .from('chesspecker_analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('[API POST /analytics/add_event] Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('[API POST /analytics/add_event] Successfully inserted event');
    return NextResponse.json({ success: true, data: eventData }, { status: 200 });

  } catch (err: unknown) {
    console.error('[API POST /analytics/add_event] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
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