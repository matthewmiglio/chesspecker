import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const today = new Date().toISOString();

    const { data, error: fetchError } = await supabase
        .from("ChessPeckerUsers")
        .select("*")
        .eq("email", email)
        .maybeSingle();

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const existing = data || {
        email,
        created_at: today,
        puzzle_starts: 0,
        correct_puzzles: 0,
        incorrect_puzzles: 0,
        set_creates: 0,
        hints: 0,
    };

    const updated = {
        ...existing,
        hints: (existing.hints || 0) + 1,
    };

    const { error: upsertError } = await supabase
        .from("ChessPeckerUsers")
        .upsert([updated], { onConflict: "email" });

    if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "hints incremented" }, { status: 200 });
}
