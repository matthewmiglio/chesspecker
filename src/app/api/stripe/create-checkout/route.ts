import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/auth/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const { priceId } = await req.json();

    // Validate price ID
    const validPriceIds = [
      process.env.STRIPE_PRICE_MONTHLY,
      process.env.STRIPE_PRICE_YEARLY,
    ];
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }

    const email = session.user.email.toLowerCase();

    // Check if user already has a Stripe customer ID
    const { data: userData } = await supabase
      .from("ChessPeckerUsers")
      .select("stripe_customer_id, tier")
      .eq("email", email)
      .single();

    // Don't allow checkout if already premium
    if (userData?.tier === "premium") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    let customerId = userData?.stripe_customer_id;

    // Create a new Stripe customer if one doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          source: "chesspecker",
        },
      });
      customerId = customer.id;

      // Store the customer ID
      await supabase
        .from("ChessPeckerUsers")
        .update({ stripe_customer_id: customerId })
        .eq("email", email);
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || "https://chesspecker.org"}/pricing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || "https://chesspecker.org"}/pricing?canceled=true`,
      metadata: {
        email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error creating checkout session:", message);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 }
    );
  }
}
