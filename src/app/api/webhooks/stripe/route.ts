import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error processing webhook:", message);
    return NextResponse.json(
      { error: `Webhook processing error: ${message}` },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerEmail) {
    console.error("No customer email in checkout session");
    return;
  }

  // Update user to premium - subscription details will be updated by subscription.updated event
  const { error } = await supabase
    .from("ChessPeckerUsers")
    .update({
      tier: "premium",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: "active",
    })
    .eq("email", customerEmail.toLowerCase());

  if (error) {
    console.error("Error updating user to premium:", error);
    throw error;
  }

  console.log(`User ${customerEmail} upgraded to premium`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Access current_period_end from the raw object (SDK types may be incomplete)
  const subData = subscription as unknown as { current_period_end?: number };
  const periodEnd = subData.current_period_end
    ? new Date(subData.current_period_end * 1000)
    : null;

  // Determine tier based on subscription status
  const tier = subscription.status === "active" ? "premium" : "free";

  const updateData: Record<string, unknown> = {
    tier,
    subscription_status: subscription.status,
  };

  if (periodEnd) {
    updateData.subscription_ends_at = periodEnd.toISOString();
  }

  const { error } = await supabase
    .from("ChessPeckerUsers")
    .update(updateData)
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Downgrade user to free
  const { error } = await supabase
    .from("ChessPeckerUsers")
    .update({
      tier: "free",
      subscription_status: "canceled",
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error downgrading user:", error);
    throw error;
  }

  console.log(`Subscription ${subscription.id} deleted, user downgraded to free`);
}
