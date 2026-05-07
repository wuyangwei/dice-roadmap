import type { BaseResult, Round, Stats } from './types.js';

export function calculateStats(rounds: Round[]): Stats {
  const total = rounds.length;
  const singles = rounds.filter((round) => round.baseResult === '单').length;
  const doubles = rounds.filter((round) => round.baseResult === '双').length;
  const joyPoints = rounds.filter((round) => round.isJoyPoint).length;

  let currentResult: BaseResult | null = null;
  let currentCount = 0;
  let longestSingleStreak = 0;
  let longestDoubleStreak = 0;

  for (const round of rounds) {
    if (round.baseResult === currentResult) {
      currentCount += 1;
    } else {
      currentResult = round.baseResult;
      currentCount = 1;
    }

    if (currentResult === '单') longestSingleStreak = Math.max(longestSingleStreak, currentCount);
    if (currentResult === '双') longestDoubleStreak = Math.max(longestDoubleStreak, currentCount);
  }

  return {
    total,
    singles,
    doubles,
    joyPoints,
    singleRate: total ? singles / total : 0,
    doubleRate: total ? doubles / total : 0,
    currentStreak: { result: currentResult, count: total ? currentCount : 0 },
    longestSingleStreak,
    longestDoubleStreak
  };
}
