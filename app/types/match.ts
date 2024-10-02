export interface FightSettings {
  age_group: string;
  gender: string;
  match_type: string;
  weight_class: string;
  round_length_str: string;
  round_length_sec: number;
  rounds_scheduled: number;
}

export interface FightInfo {
  red_name: string;
  blue_name: string;
  date: string;
  result: string;
  winner: string;
  cancelled: boolean;
  started: boolean;
  started_at: number | null;
}

export interface Match {
  id: number;
  fight_settings: FightSettings;
  fight_info: FightInfo;
}

export interface MatchesResponse {
  results: Match[];
  page: number;
  per_page: number;
  count: number;
  has_more: boolean;
}

export interface CreateMatchRequest {
  fight_settings: FightSettings;
  fight_info: FightInfo;
}

// ... existing types

export interface Prediction {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  points_aggression: number;
  points_pressure: number;
  points_impact: number;
  points_total: number;
  win_confidence: number;
  win_dominance: number;
  prediction: "win" | "lose" | "draw";
  avg_impact_points_per_landed: number;
  avg_impact_points_per_thrown: number;
}

export interface RoundInfo {
  match_id: number;
  round_num: number;
  status: "active" | "completed" | "upcoming";
}

export interface StatsSummary {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  accuracy: number;
  aggression: number;
  aggression_combinations: number;
  aggression_exchanges: number;
  aggression_power: number;
  pressure: number;
  pressure_distance: number;
  pressure_movement: number;
  pressure_position: number;
  punch_landed: number;
  punch_thrown: number;
  punch_landed_high_impact: number;
  punch_thrown_power: number;
}

export interface Balance {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  back_foot: number;
  front_foot: number;
  neutral: number;
}

export interface Distance {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  clinch: number;
  inside: number;
  mid_range: number;
  outside: number;
}

export interface Stance {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  orthodox: number;
  southpaw: number;
  squared: number;
}

export interface PunchCombinationsSummary {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  singles_thrown: number;
  doubles_thrown: number;
  triples_thrown: number;
  quads_more_thrown: number;
  singles_num_punches: number;
  doubles_num_punches: number;
  triples_num_punches: number;
  quads_more_num_punches: number;
}

export interface Distribution {
  min: number;
  low: number;
  mid: number;
  high: number;
  max: number;
}

export interface Punch {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  punch_type: string;
  landed: number;
  thrown: number;
  landed_quality_dist: Distribution;
  power_commit_dist: Distribution;
  impact_dist: Distribution;
}

export interface PunchCombination {
  match_id: number;
  round_num: number;
  corner: "red" | "blue";
  punch_sequence: string[];
  punch_sequence_quality_props: string[];
  punch_sequence_power_commit_props: string[];
  punch_sequence_impact_props: string[];
}

export interface RoundStats {
  predictions: Prediction[];
  rounds_info: RoundInfo[];
  stats_summary: StatsSummary[];
  balance: Balance[];
  distance: Distance[];
  stance: Stance[];
  punch_combinations_summary: PunchCombinationsSummary[];
  punches: Punch[];
  punch_combinations: PunchCombination[];
}

export interface MatchStats {
  fight_info: FightInfo;
  round_stats: RoundStats[] | void[];
}
