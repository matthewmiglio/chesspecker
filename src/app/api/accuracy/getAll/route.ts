import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
    const { set_id, repeat_index } = await req.json();

    if (!set_id || repeat_index === undefined) {
        return NextResponse.json(
            { error: "Missing set_id or repeat_index" },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("chessPeckerSetAccuracies")
        .select("*")


    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sets: data }, { status: 200 });
}
