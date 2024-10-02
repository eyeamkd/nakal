import { NextRequest, NextResponse } from "next/server";
import { getMatch, updateMatch, deleteMatch } from "../../../lib/matches";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = await getMatch(parseInt(params.id, 10));
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }
    return NextResponse.json(match);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedMatch = await updateMatch(parseInt(params.id, 10), body);
    if (!updatedMatch) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteMatch(parseInt(params.id, 10));
    if (!deleted) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}
