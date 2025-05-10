import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST() {
    const today = new Date().toISOString().split("T")[0];

    const { data, error: fetchError } = await supabase
        .from("DailyUsageStats")
        .select("correct_puzzles")
        .eq("day", today)
        .maybeSingle();

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const newValue = (data?.correct_puzzles || 0) + 1;

    const { error: updateError } = await supabase
        .from("DailyUsageStats")
        .upsert([{ day: today, correct_puzzles: newValue }]);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Correct count updated." }, { status: 200 });
}
