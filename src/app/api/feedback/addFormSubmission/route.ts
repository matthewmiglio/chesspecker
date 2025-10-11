// src/app/api/feedback/addFormSubmission/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { feedbackLimiter, getClientIdentifier } from "@/lib/rateLimit";

// Validation schema for feedback submission
const feedbackSchema = z.object({
  email: z.string().email("Invalid email address").max(200, "Email too long"),
  text: z.string().min(1, "Feedback text is required").max(1000, "Feedback must be 1000 characters or less").trim(),
  stars: z.number().int().min(0, "Stars must be 0 or greater").max(5, "Stars must be 5 or less").optional().default(0),
  category: z.string().max(50, "Category too long").optional().default("other"),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  // Rate limiting: 5 requests per minute per IP
  if (feedbackLimiter) {
    const identifier = getClientIdentifier(req);
    const { success, limit, remaining, reset } = await feedbackLimiter.limit(identifier);

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
  const validation = feedbackSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  const { email, text, stars, category } = validation.data;

  const { error } = await supabase.from("ChessPeckerFeedback").insert({
    email,
    text,
    stars,
    category,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error("[addFormSubmission] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Feedback submitted successfully" });
}
