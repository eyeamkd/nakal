import {
  RoundStats,
  Prediction,
  RoundInfo,
  StatsSummary,
  Balance,
  Distance,
  Stance,
  PunchCombinationsSummary,
  Punch,
  PunchCombination,
  Distribution,
} from "../types/match";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateDistribution(): Distribution {
  const total = 100;
  const min = randomInt(0, 20);
  const low = randomInt(10, 30);
  const mid = randomInt(20, 40);
  const high = randomInt(10, 30);
  const max = total - (min + low + mid + high);

  return {
    min: min / 100,
    low: low / 100,
    mid: mid / 100,
    high: high / 100,
    max: max / 100,
  };
}

function generatePunchType(): string {
  const types = ["jab", "cross", "hook", "uppercut"];
  return types[randomInt(0, types.length - 1)];
}

function generatePunchSequence(): string[] {
  const sequence = [];
  const length = randomInt(2, 5);
  for (let i = 0; i < length; i++) {
    sequence.push(generatePunchType());
  }
  return sequence;
}

function generateQualityProps(length: number): string[] {
  const qualities = ["low", "medium", "high"];
  return Array(length)
    .fill(null)
    .map(() => qualities[randomInt(0, 2)]);
}

export function generateRoundStats(
  matchId: number,
  roundNum: number
): RoundStats {
  const corners: ("red" | "blue")[] = ["red", "blue"];

  const predictions: Prediction[] = corners.map((corner) => ({
    match_id: matchId,
    round_num: roundNum,
    corner,
    points_aggression: randomFloat(0, 10),
    points_pressure: randomFloat(0, 10),
    points_impact: randomFloat(0, 10),
    points_total: randomFloat(0, 30),
    win_confidence: Math.random(),
    win_dominance: Math.random(),
    prediction:
      Math.random() > 0.6 ? "win" : Math.random() > 0.3 ? "lose" : "draw",
    avg_impact_points_per_landed: randomFloat(0, 5),
    avg_impact_points_per_thrown: randomFloat(0, 3),
  }));

  const rounds_info: RoundInfo[] = [
    {
      match_id: matchId,
      round_num: roundNum,
      status: "active",
    },
  ];

  const stats_summary: StatsSummary[] = corners.map((corner) => ({
    match_id: matchId,
    round_num: roundNum,
    corner,
    accuracy: Math.random(),
    aggression: Math.random(),
    aggression_combinations: Math.random(),
    aggression_exchanges: Math.random(),
    aggression_power: Math.random(),
    pressure: Math.random(),
    pressure_distance: Math.random(),
    pressure_movement: Math.random(),
    pressure_position: Math.random(),
    punch_landed: randomInt(20, 100),
    punch_thrown: randomInt(50, 200),
    punch_landed_high_impact: randomInt(5, 50),
    punch_thrown_power: randomInt(20, 100),
  }));

  const balance: Balance[] = corners.map((corner) => {
    const total = 100;
    const back_foot = randomInt(20, 40);
    const front_foot = randomInt(20, 40);
    const neutral = total - (back_foot + front_foot);
    return {
      match_id: matchId,
      round_num: roundNum,
      corner,
      back_foot: back_foot / 100,
      front_foot: front_foot / 100,
      neutral: neutral / 100,
    };
  });

  const distance: Distance[] = corners.map((corner) => {
    const total = 100;
    const clinch = randomInt(5, 20);
    const inside = randomInt(20, 40);
    const mid_range = randomInt(30, 50);
    const outside = total - (clinch + inside + mid_range);
    return {
      match_id: matchId,
      round_num: roundNum,
      corner,
      clinch: clinch / 100,
      inside: inside / 100,
      mid_range: mid_range / 100,
      outside: outside / 100,
    };
  });

  const stance: Stance[] = corners.map((corner) => {
    const total = 100;
    const orthodox = randomInt(60, 90);
    const southpaw = randomInt(5, 20);
    const squared = total - (orthodox + southpaw);
    return {
      match_id: matchId,
      round_num: roundNum,
      corner,
      orthodox: orthodox / 100,
      southpaw: southpaw / 100,
      squared: squared / 100,
    };
  });

  const punch_combinations_summary: PunchCombinationsSummary[] = corners.map(
    (corner) => ({
      match_id: matchId,
      round_num: roundNum,
      corner,
      singles_thrown: randomInt(30, 100),
      doubles_thrown: randomInt(15, 50),
      triples_thrown: randomInt(5, 25),
      quads_more_thrown: randomInt(0, 10),
      singles_num_punches: randomInt(30, 100),
      doubles_num_punches: randomInt(30, 100),
      triples_num_punches: randomInt(15, 75),
      quads_more_num_punches: randomInt(0, 40),
    })
  );

  const punches: Punch[] = corners.flatMap((corner) =>
    ["jab", "cross", "hook", "uppercut"].map((punch_type) => ({
      match_id: matchId,
      round_num: roundNum,
      corner,
      punch_type,
      landed: randomInt(5, 50),
      thrown: randomInt(10, 100),
      landed_quality_dist: generateDistribution(),
      power_commit_dist: generateDistribution(),
      impact_dist: generateDistribution(),
    }))
  );

  const punch_combinations: PunchCombination[] = corners.flatMap((corner) =>
    Array(randomInt(3, 8))
      .fill(null)
      .map(() => {
        const sequence = generatePunchSequence();
        return {
          match_id: matchId,
          round_num: roundNum,
          corner,
          punch_sequence: sequence,
          punch_sequence_quality_props: generateQualityProps(sequence.length),
          punch_sequence_power_commit_props: generateQualityProps(
            sequence.length
          ),
          punch_sequence_impact_props: generateQualityProps(sequence.length),
        };
      })
  );

  return {
    predictions,
    rounds_info,
    stats_summary,
    balance,
    distance,
    stance,
    punch_combinations_summary,
    punches,
    punch_combinations,
  };
}
