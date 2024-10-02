import {
  Match,
  MatchesResponse,
  CreateMatchRequest,
  RoundStats,
  MatchStats,
} from "../types/match";
import {
  generateMockFightSettings,
  generateMockFightInfo,
} from "./mockDataGenerator";
import { generateRoundStats } from "./statsGenerator";
import { supabase } from "./supabase";

export async function getMatches(
  page: number = 1,
  per_page: number = 20
): Promise<MatchesResponse> {
  const start = (page - 1) * per_page;
  const end = start + per_page - 1;

  const {
    data: matches,
    count,
    error,
  } = await supabase
    .from("matches")
    .select("*", { count: "exact" })
    .range(start, end);

  if (error) {
    throw new Error(error.message);
  }

  return {
    results: matches as Match[],
    page,
    per_page,
    count: count || 0,
    has_more: (count || 0) > end + 1,
  };
}

export async function createMatches(): Promise<Match[]> {
  const newMatches: CreateMatchRequest[] = Array.from({ length: 10 }, () => ({
    fight_settings: generateMockFightSettings(),
    fight_info: {
      ...generateMockFightInfo(),
      started: false,
      started_at: null,
    },
  }));

  const { data, error } = await supabase
    .from("matches")
    .insert(newMatches)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as Match[];
}

export async function getMatch(id: number): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Match | null;
}

export async function updateMatch(
  id: number,
  data: Partial<Match>
): Promise<Match | null> {
  const { data: updatedMatch, error } = await supabase
    .from("matches")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updatedMatch as Match | null;
}

export async function deleteMatch(id: number): Promise<boolean> {
  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function createMatchWithRoundStats(
  match: Match
): Promise<MatchStats> {
  const { data, error } = await supabase
    .from("matches")
    .insert(match)
    .select()
    .single();

  if (error) throw error;

  const roundStats: RoundStats[] = [];
  for (let i = 1; i <= match.fight_settings.rounds_scheduled; i++) {
    const stats = generateRoundStats(data.id, i);
    roundStats.push(stats);
  }

  const { error: statsError } = await supabase.from("round_stats").insert(
    roundStats.flatMap((stats) => [
      ...stats.predictions,
      ...stats.rounds_info,
      ...stats.stats_summary,
      // ... flatten other arrays
    ])
  );

  if (statsError) throw statsError;

  return {
    fight_info: data.fight_info,
    round_stats: roundStats,
  };
}

export async function getMatchStats(
  matchId: number,
  corner: string
): Promise<MatchStats> {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError) throw matchError;

  const { data: roundStats, error: statsError } = await supabase
    .from("round_stats")
    .select("*")
    .eq("match_id", matchId)
    .order("round_num", { ascending: true });

  if (statsError) throw statsError;

  console.log("Round Stats", roundStats);

  const filteredStats = roundStats.map((round) => {
    Object.keys(round.stats).forEach((key) => {
      console.log("Key is", key, "round.stats[key] is", round.stats[key]);
      const filteredKey = round.stats[key].filter(
        (s: any) => s.corner === corner
      );
      round.stats[key] = filteredKey;
      console.log("Round is and filtered key is", round, filteredKey);
    });
    return round;
  });

  return {
    fight_info: match.fight_info,
    round_stats: filteredStats,
  };
}

export async function addRoundToActiveMatch(matchId: number, roundNum: number) {
  try {
    // Generate round stats
    const roundStats = generateRoundStats(matchId, roundNum);

    // Insert the new round stats into the database
    const { data, error } = await supabase.from("round_stats").insert([
      {
        match_id: matchId,
        round_num: roundNum,
        ...roundStats,
      },
    ]);

    if (error) {
      throw error;
    }

    console.log(`Round ${roundNum} added to match ${matchId}`);

    // Update the match's current round
    await supabase
      .from("matches")
      .update({ "fight_info.current_round": roundNum })
      .eq("id", matchId);

    return data;
  } catch (error) {
    console.error(`Error adding round ${roundNum} to match ${matchId}:`, error);
    throw error;
  }
}

export async function updateRoundStats(
  matchId: number,
  roundNum: number,
  updates: Partial<RoundStats>
) {
  try {
    const { data, error } = await supabase
      .from("round_stats")
      .update(updates)
      .eq("match_id", matchId)
      .eq("round_num", roundNum);

    if (error) {
      throw error;
    }

    console.log(`Round ${roundNum} stats updated for match ${matchId}`);
    return data;
  } catch (error) {
    console.error(
      `Error updating round ${roundNum} stats for match ${matchId}:`,
      error
    );
    throw error;
  }
}
