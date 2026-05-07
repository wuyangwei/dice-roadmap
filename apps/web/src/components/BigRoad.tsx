import { buildBigRoad, type Round } from '@roadmap/shared';
import { RoadCell } from './RoadCell.js';

export function BigRoad({ rounds }: { rounds: Round[] }) {
  const cells = buildBigRoad(rounds);
  const cols = Math.max(16, ...cells.map((cell) => cell.col + 1), 1);

  return (
    <div className="road-scroll big-road">
      <div className="road-grid" style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size))` }}>
        {cells.map((cell) => (
          <div key={cell.round.id} style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}>
            <RoadCell round={cell.round} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
