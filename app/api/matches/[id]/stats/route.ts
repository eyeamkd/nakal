import { NextRequest, NextResponse } from "next/server";
import { getMatchStats, updateRoundStats } from "../../../../lib/matches";

const filterRound = (round:any) => {
  const currentTimestamp = Date.now(); 
  const paramArrayKeys = Object.keys(round); 
  const result:any = {};
  paramArrayKeys.forEach((key) => {
    console.log("round value", round[key]);
    const filteredData = round[key].map((item:any)=>{ 
      if(item.mock_start < currentTimestamp) return item
      else { 
        console.log("Didnot get filtered data"); 
        return null;
      };
    }); 
    if(filteredData.length > 0){
     result[key] = filteredData;
    }else{ 
      console.log("Didnot get filtered ");
    }
  }) 
  return result;
}


const filterResponse = (response:any) => {
  const result:any = []; 
  response.round_stats.forEach( (round:any) =>  
      result.push(filterRound(round))
  ); 
result.filter((item:any)=> {
      Object.keys(item).forEach((key:any)=>{ 
          if(item[key].some((item:any)=> item === null)){ 
              delete item[key];
          }
      })
      return Object.keys(item).length > 0;
  }) 
result.filter((item:any)=> Object.keys(item).length !== 0) 
return result;
}



export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; corner: string } }
) {
  try {
    const matchStats = await getMatchStats(
      params.id,
      params.corner
    );
    const filteredRoundStats = filterResponse(matchStats);
    if (matchStats) {
      matchStats.round_stats = filteredRoundStats;
    }

    return NextResponse.json({ matchStats });
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
