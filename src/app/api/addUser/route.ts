import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const verbose = true;

export async function POST(req: NextRequest) {
    if (verbose) console.log("Adding a user");

    const { email, password } = await req.json();

    if (verbose) {
        console.log("\temail to add:", email);
        console.log("\tpass to add:", password);
    }

    const { data, error } = await supabase
        .from("chessPeckerUsers")
        .insert([{ email, pass: password }])
        .select(); // This forces the inserted row to be returned


    if (verbose) { console.log('addUser: data', data) };
    if (verbose) { console.log('addUser: error', error) };

    if (error) {
        if (verbose) console.error("Supabase insert error:", error);

        if (error.code === "23505" || error.message.includes("duplicate key")) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    return NextResponse.json({ user: data[0] }, { status: 201 });
}
