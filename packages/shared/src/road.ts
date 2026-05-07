import type { Round } from './types.js';

export type RoadCell = {
  row: number;
  col: number;
  round: Round;
};

export function buildBeadRoad(rounds: Round[], rows = 6): RoadCell[] {
  return rounds.map((round, index) => ({
    row: index % rows,
    col: Math.floor(index / rows),
    round
  }));
}

export function buildBigRoad(rounds: Round[], maxRows = 6): RoadCell[] {
  const cells: RoadCell[] = [];
  let col = 0;
  let row = 0;

  rounds.forEach((round, index) => {
    if (index === 0) {
      cells.push({ row, col, round });
      return;
    }

    const previous = rounds[index - 1];
    if (round.baseResult === previous.baseResult) {
      if (row < maxRows - 1) {
        row += 1;
      } else {
        col += 1;
      }
    } else {
      col += 1;
      row = 0;
    }

    cells.push({ row, col, round });
  });

  return cells;
}
