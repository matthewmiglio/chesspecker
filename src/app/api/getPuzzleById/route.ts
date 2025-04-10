import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing puzzle ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://lichess.org/api/puzzle/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_LICHESS_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch puzzle by ID:", err);
    return NextResponse.json(
      { error: "Failed to fetch puzzle" },
      { status: 500 }
    );
  }
}
