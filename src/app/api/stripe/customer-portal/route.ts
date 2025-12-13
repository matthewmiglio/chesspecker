import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase();

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from("ChessPeckerUsers")
      .select("stripe_customer_id")
      .eq("email", email)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL || "https://chesspecker.org"}/pricing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error creating portal session:", message);
    return NextResponse.json(
      { error: `Failed to create portal session: ${message}` },
      { status: 500 }
    );
  }
}
