import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const verbose = true;

export async function POST(req: NextRequest) {
    if (verbose) console.log("Adding a set");

    const { name, user_id, difficulties, size, repeats } = await req.json();

    if (verbose) {
        console.log("\tname:", name);
        console.log("\tuser_id:", user_id);
        console.log("\tdifficulties:", difficulties);
        console.log("\tsize:", size);
        console.log("\trepeats:", repeats);
    }

    const { data, error } = await supabase
        .from("chessPeckerSets")
        .insert([{ name, user_id, difficulties, size, repeats, puzzle_ids: [] }])
        .select(); // Return the inserted row

    if (verbose) { console.log('addSet: data', data) };
    if (verbose) { console.log('addSet: error', error) };

    if (error) {
        if (verbose) console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        return NextResponse.json({ error: "Set creation failed" }, { status: 500 });
    }

    return NextResponse.json({ set: data[0] }, { status: 201 });
}
