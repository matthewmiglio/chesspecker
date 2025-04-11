import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const verbose = true;

export async function POST(req: NextRequest) {
  if (verbose) console.log("Fetching sets for user");

  const { email } = await req.json();

  if (verbose) console.log("\temail:", email);

  const { data, error } = await supabase
    .from("chessPeckerSets")
    .select("*")
    .eq("email", email);

  if (verbose) {
    console.log("getSets: data", data);
    console.log("getSets: error", error);
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sets: data }, { status: 200 });
}
