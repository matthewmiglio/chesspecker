import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty") ?? "normal";
  const theme = searchParams.get("theme");

  const url = new URL("https://lichess.org/api/puzzle/next");
  url.searchParams.set("difficulty", difficulty);
  if (theme) url.searchParams.set("theme", theme);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_LICHESS_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch puzzles:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
