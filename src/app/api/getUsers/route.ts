import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const verbose = false;

export async function GET(req: NextRequest) {
    try {

        if (verbose) {console.log('supabaseUrl', supabaseUrl)};
        if (verbose) {console.log('supabaseKey', supabaseKey)};
        const table = "chessPeckerUsers";
        const { data, error } = await supabase.from(table).select("*");

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
    }
}
