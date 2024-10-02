import { NextRequest, NextResponse } from "next/server";
import { getMatchStats, updateRoundStats } from "../../../../lib/matches";
import { listScheduledJobs } from "../../../../lib/jobHandler";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; corner: string } }
) {
  try {
    const matchStats = await getMatchStats(
      parseInt(params.id, 10),
      params.corner
    );
    console.log("All jobs: ", listScheduledJobs());
    // return NextResponse.json(matchStats);
    return NextResponse.json({ allJobs: listScheduledJobs() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch match stats" },
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
    const { roundNum, stats } = body;
    await updateRoundStats(parseInt(params.id, 10), roundNum, stats);
    return NextResponse.json({ message: "Stats updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update match stats" },
      { status: 500 }
    );
  }
}
