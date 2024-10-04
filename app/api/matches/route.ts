import { NextRequest, NextResponse } from "next/server";
import { createMatches, getCurrentRunningMatches, getPastMatches, getUpcomingMatches, insertMatches } from "../../lib/matches";


// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const per_page = parseInt(searchParams.get("per_page") || "20", 10);

//   const matchesResponse = getMatches(page, per_page);
//   return NextResponse.json(matchesResponse);
// }

export async function POST() {
  try {
    const newMatches = await createMatches();
    await insertMatches(newMatches);
    // scheduleMatches(); // Start the match scheduler
    return NextResponse.json(newMatches, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create matches" },
      { status: 500 }
    );
  }
} 

export async function GET(request: NextRequest){ 
  const category =request.nextUrl.searchParams.get("category");
  switch(category){
    case "upcoming":
      const upcomingMatches = await getUpcomingMatches();
      return NextResponse.json(upcomingMatches);
    case "past":
      const pastMatches = await getPastMatches();
      return NextResponse.json(pastMatches);
    default:
      const currentRunningMatches = await getCurrentRunningMatches();
      return NextResponse.json(currentRunningMatches);
  }
}