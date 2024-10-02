import cron from "node-cron";
import { supabase } from "./supabase";
import { Match } from "../types/match";
import { addRoundToActiveMatch, updateRoundStats } from "./matches"; // Assuming these functions exist
const MINUTE_IN_MS = 60 * 1000;

interface ScheduledTask {
  name: string;
  task: cron.ScheduledTask;
  description: string;
  createdAt: Date;
}

interface ActiveMatch {
  matchId: number;
  timeouts: NodeJS.Timeout[];
}

const scheduledTasks: { [key: string]: ScheduledTask } = {};
const activeMatches: { [key: number]: ActiveMatch } = {};

export function scheduleMatches() {
  if (scheduledTasks["matchScheduler"]) {
    scheduledTasks["matchScheduler"].task.stop();
    delete scheduledTasks["matchScheduler"];
  }

  setTimeout(() => {
    startNextMatch();
    const task = cron.schedule("* * * * *", checkForNewMatches);
    scheduledTasks["matchScheduler"] = {
      name: "matchScheduler",
      task: task,
      description: "Checks for new matches every minute",
      createdAt: new Date(),
    };
  }, 2 * MINUTE_IN_MS);
}

export async function checkForNewMatches() {
  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("fight_info->>started", false)
    .is("fight_info->>started_at", null)
    .is("fight_info->>completed", false)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (!error && match) {
    startNextMatch();
  }
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
  const matchId = typedMatch.id;

  if (activeMatches[matchId]) {
    cancelMatch(matchId);
  }

  activeMatches[matchId] = { matchId, timeouts: [] };

  const startTime = new Date().getTime();
  const roundLength = typedMatch.fight_settings.round_length_sec * 1000;
  const roundsScheduled = 10;
  const breakDuration = 2 * MINUTE_IN_MS;
  const totalMatchDuration =
    (roundLength + breakDuration) * roundsScheduled - breakDuration;

  await supabase
    .from("matches")
    .update({ "fight_info.started": true, "fight_info.started_at": startTime })
    .eq("id", matchId);

  for (let roundNum = 1; roundNum <= roundsScheduled; roundNum++) {
    scheduleRound(matchId, roundNum, startTime, roundLength, breakDuration);
  }

  scheduleMatchEnd(matchId, startTime + totalMatchDuration, typedMatch);
}

function scheduleRound(
  matchId: number,
  roundNum: number,
  startTime: number,
  roundLength: number,
  breakDuration: number
) {
  const roundStartTime =
    startTime + (roundNum - 1) * (roundLength + breakDuration);

  activeMatches[matchId].timeouts.push(
    setTimeout(() => {
      addRoundToActiveMatch(matchId, roundNum);
    }, roundStartTime - startTime)
  );

  activeMatches[matchId].timeouts.push(
    setTimeout(async () => {
      await updateRoundStats(matchId, roundNum, {
        rounds_info: [
          { match_id: matchId, round_num: roundNum, status: "completed" },
        ],
      });
      console.log(`Round ${roundNum} completed for match ${matchId}`);
    }, roundStartTime - startTime + roundLength)
  );
}

function scheduleMatchEnd(matchId: number, endTime: number, match: Match) {
  activeMatches[matchId].timeouts.push(
    setTimeout(async () => {
      const result =
        Math.random() < 0.1
          ? "Draw"
          : Math.random() < 0.5
          ? "Red Win"
          : "Blue Win";
      const winner =
        result === "Red Win"
          ? match.fight_info.red_name
          : result === "Blue Win"
          ? match.fight_info.blue_name
          : "";

      await supabase
        .from("matches")
        .update({
          "fight_info.started": false,
          "fight_info.result": result,
          "fight_info.winner": winner,
          "fight_info.completed": true,
          "fight_info.completed_at": new Date().toISOString(),
        })
        .eq("id", matchId);

      console.log(`Match ${matchId} ended at ${new Date().toISOString()}`);
      delete activeMatches[matchId];
      startNextMatch();
    }, endTime - Date.now())
  );
}

export function cancelMatchScheduler() {
  if (scheduledTasks["matchScheduler"]) {
    scheduledTasks["matchScheduler"].task.stop();
    delete scheduledTasks["matchScheduler"];
    console.log("Match scheduler has been canceled");
  } else {
    console.log("No active match scheduler to cancel");
  }
}

export function cancelMatch(matchId: number) {
  if (activeMatches[matchId]) {
    activeMatches[matchId].timeouts.forEach(clearTimeout);
    delete activeMatches[matchId];
    console.log(`Match ${matchId} has been canceled`);
  } else {
    console.log(`No active timeouts for match ${matchId}`);
  }
}

export function cancelAllMatches() {
  Object.keys(activeMatches).forEach((matchId) => {
    cancelMatch(Number(matchId));
  });
  console.log("All active matches have been canceled");
}

export function listScheduledJobs(): ScheduledTask[] {
  return Object.values(scheduledTasks);
}

export function listActiveMatches(): number[] {
  return Object.keys(activeMatches).map(Number);
}

export function cancelAllJobs() {
  cancelMatchScheduler();
  cancelAllMatches();
  console.log("All jobs and active matches have been canceled");
}
