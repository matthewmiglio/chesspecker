import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { difficulty = "normal", theme } = await req.json();

  const url = new URL("https://lichess.org/api/puzzle/next");
  url.searchParams.set("difficulty", difficulty);
  if (theme) url.searchParams.set("theme", theme);
  console.log("Fetching puzzle with params:", url.toString());

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch puzzle" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch puzzle:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
