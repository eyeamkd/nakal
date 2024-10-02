import { faker } from "@faker-js/faker";
import { FightSettings, FightInfo } from "../types/match";

const ageGroups = ["Junior", "Youth", "Elite", "Senior"];
const matchTypes = ["Amateur", "Professional"];
const weightClasses = [
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
  "Super Heavyweight",
];

export function generateMockFightSettings(): FightSettings {
  return {
    age_group: faker.helpers.arrayElement(ageGroups),
    gender: faker.person.sex(),
    match_type: faker.helpers.arrayElement(matchTypes),
    weight_class: faker.helpers.arrayElement(weightClasses),
    round_length_str: "3 minutes",
    round_length_sec: 180,
    rounds_scheduled: faker.helpers.arrayElement([3, 6, 9, 12]),
  };
}

export function generateMockFightInfo(): FightInfo {
  const started = faker.datatype.boolean();
  const startedAt = started ? faker.date.recent({ days: 1 }).getTime() : 0;
  const cancelled = !started && faker.datatype.boolean({ probability: 0.1 });

  let result = "";
  let winner = "";

  if (started && !cancelled) {
    result = faker.helpers.arrayElement(["Red Win", "Blue Win", "Draw", ""]);
    winner = result === "Red Win" ? "Red" : result === "Blue Win" ? "Blue" : "";
  }

  return {
    red_name: faker.person.fullName(),
    blue_name: faker.person.fullName(),
    date: faker.date.recent({ days: 30 }).toISOString().split("T")[0],
    result,
    winner,
    cancelled,
    started,
    started_at: startedAt,
  };
}
