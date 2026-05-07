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
  // 记录每列已占用的最大行数（0-based），用于检测碰撞
  const colHeight: Record<number, number> = {};

  const occupy = (c: number, r: number) => {
    colHeight[c] = Math.max(colHeight[c] ?? -1, r);
  };

  const heightOf = (c: number) => colHeight[c] ?? -1;

  let col = 0;
  let row = 0;

  rounds.forEach((round, index) => {
    if (index === 0) {
      occupy(col, row);
      cells.push({ row, col, round });
      return;
    }

    const previous = rounds[index - 1];
    if (round.baseResult === previous.baseResult) {
      // 同结果：尝试向下，到底后向右折叠
      if (row < maxRows - 1) {
        row += 1;
      } else {
        // 已到底，向右折叠：找到不会与已有内容碰撞的列
        let nextCol = col + 1;
        while (heightOf(nextCol) >= maxRows - 1) {
          nextCol += 1;
        }
        col = nextCol;
        // 折叠后行号紧贴该列已有内容的下方，但不超过 maxRows-1
        row = Math.min(maxRows - 1, heightOf(col) + 1);
      }
    } else {
      // 换结果：新列从第0行开始，但要跳过被折叠内容占用的列
      let nextCol = col + 1;
      while (heightOf(nextCol) >= 0) {
        nextCol += 1;
      }
      col = nextCol;
      row = 0;
    }

    occupy(col, row);
    cells.push({ row, col, round });
  });

  return cells;
}
