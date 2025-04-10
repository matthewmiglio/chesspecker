import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const verbose = true;

export async function POST(req: NextRequest) {
    const { set_id, puzzle_id } = await req.json();

    if (verbose) {
        console.log("Adding puzzle to set:");
        console.log("\tset_id:", set_id);
        console.log("\tpuzzle_id:", puzzle_id);
    }

    if (!set_id || !puzzle_id) {
        return NextResponse.json({ error: "Missing set_id or puzzle_id" }, { status: 400 });
    }

    const { data: setData, error: fetchError } = await supabase
        .from("chessPeckerSets")
        .select("puzzle_ids")
        .eq("set_id", set_id)
        .single();

    if (fetchError || !setData) {
        return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    const updatedPuzzleIds = [...(setData.puzzle_ids || []), puzzle_id];

    const { error: updateError } = await supabase
        .from("chessPeckerSets")
        .update({ puzzle_ids: updatedPuzzleIds })
        .eq("set_id", set_id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Puzzle added to set successfully" }, { status: 200 });
}
