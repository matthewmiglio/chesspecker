import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
    const { set_id } = await req.json();

    if (!set_id) {
        return NextResponse.json({ error: "Missing set_id" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("chessPeckerSets")
        .select("repeat_number, puzzle_number")
        .eq("set_id", set_id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Set not found or fetch error" }, { status: 404 });
    }

    return NextResponse.json({ progress: data }, { status: 200 });
}
