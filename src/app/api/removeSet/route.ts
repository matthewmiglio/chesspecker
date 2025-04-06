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

    const { error } = await supabase
        .from("chessPeckerSets")
        .delete()
        .eq("set_id", set_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Set deleted successfully" }, { status: 200 });
}
