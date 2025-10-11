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

  try {
    // Rate limiting: 100 requests per minute per IP
    const { analyticsLimiter, getClientIdentifier } = await import('@/lib/rateLimit');

    if (analyticsLimiter) {
      const identifier = getClientIdentifier(req);
      const { success, limit, remaining, reset } = await analyticsLimiter.limit(identifier);

      if (!success) {
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
    }

    const body = await req.json();

    // Validate input with Zod
    const validation = analyticsEventSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { path, referrer, visitor_id, session_id, ua } = validation.data;

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