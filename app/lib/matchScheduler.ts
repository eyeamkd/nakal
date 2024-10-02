import cron from "node-cron";
import { supabase } from "./supabase";
import { Match } from "../types/match";
import { generateRoundStats } from "./statsGenerator";
import { updateRoundStats } from "./matches";

const MINUTE_IN_MS = 60 * 1000;

async function addRoundToActiveMatch(matchId: number, roundNum: number) {
  console.log(`Adding round ${roundNum} to match ${matchId}`);

  const roundStats = generateRoundStats(matchId, roundNum);
  console.log("Round Stats", roundStats);
  // Set the round status to 'active'
  roundStats.rounds_info[0].status = "active";

  try {
    await updateRoundStats(matchId, roundNum, roundStats);
  } catch (error) {
    console.error(`Error adding round ${roundNum} to match ${matchId}:`, error);
  }

  console.log(`Round ${roundNum} added to match ${matchId}`);
}

async function startNextMatch() {
  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("fight_info->>started", false)
    .is("fight_info->>started_at", null)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error || !match) {
    console.error("No matches to start or error occurred:", error);
    return;
  }

  const typedMatch = match as Match;
  const startTime = new Date().getTime();
  const roundLength = typedMatch.fight_settings.round_length_sec * 1000; // Convert to milliseconds
  const roundsScheduled = 10; // Set to 10 rounds
  const breakDuration = 2 * MINUTE_IN_MS; // 2-minute break between rounds
  const totalMatchDuration =
    (roundLength + breakDuration) * roundsScheduled - breakDuration;

  await supabase
    .from("matches")
    .update({ "fight_info.started": true, "fight_info.started_at": startTime })
    .eq("id", typedMatch.id);

  console.log(
    `Match ${typedMatch.id} started at ${new Date(startTime).toISOString()}`
  );

  // Schedule rounds
  for (let roundNum = 1; roundNum <= roundsScheduled; roundNum++) {
    const roundStartTime =
      startTime + (roundNum - 1) * (roundLength + breakDuration);

    // Add round at the start of each round
    setTimeout(() => {
      addRoundToActiveMatch(typedMatch.id, roundNum);
    }, roundStartTime - startTime);

    // Update round status to 'completed' at the end of the round
    setTimeout(async () => {
      await updateRoundStats(typedMatch.id, roundNum, {
        rounds_info: [
          { match_id: typedMatch.id, round_num: roundNum, status: "completed" },
        ],
      });
      console.log(`Round ${roundNum} completed for match ${typedMatch.id}`);
    }, roundStartTime - startTime + roundLength);
  }

  // Schedule match end
  setTimeout(async () => {
    const result =
      Math.random() < 0.1
        ? "Draw"
        : Math.random() < 0.5
        ? "Red Win"
        : "Blue Win";
    const winner =
      result === "Red Win"
        ? typedMatch.fight_info.red_name
        : result === "Blue Win"
        ? typedMatch.fight_info.blue_name
        : "";

    await supabase
      .from("matches")
      .update({
        "fight_info.started": false,
        "fight_info.result": result,
        "fight_info.winner": winner,
        "fight_info.completed": true, // Mark the match as completed
        "fight_info.completed_at": new Date().toISOString(), // Add completion timestamp
      })
      .eq("id", typedMatch.id);

    console.log(`Match ${typedMatch.id} ended at ${new Date().toISOString()}`);
    startNextMatch(); // Start the next match
  }, totalMatchDuration);
}

export function scheduleMatches() {
  // Start the first match after 2 minutes
  setTimeout(() => {
    startNextMatch();
    // Check for new matches every minute
    cron.schedule("* * * * *", () => {
      supabase
        .from("matches")
        .select("*")
        .eq("fight_info->>started", false)
        .is("fight_info->>started_at", null)
        .is("fight_info->>completed", false) // Add this line
        .order("id", { ascending: true })
        .limit(1)
        .single()
        .then(({ data: match, error }) => {
          if (!error && match) {
            startNextMatch();
          }
        });
    });
  }, 2 * MINUTE_IN_MS);
}
