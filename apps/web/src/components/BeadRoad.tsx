import { buildBeadRoad, type Round } from '@roadmap/shared';
import { RoadCell } from './RoadCell.js';

export function BeadRoad({ rounds }: { rounds: Round[] }) {
  const cells = buildBeadRoad(rounds);
  const cols = Math.max(12, ...cells.map((cell) => cell.col + 1), 1);

  return (
    <div className="road-scroll">
      <div className="road-grid" style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size))` }}>
        {cells.map((cell) => (
          <div key={cell.round.id} style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}>
            <RoadCell round={cell.round} />
          </div>
        ))}
      </div>
    </div>
  );
}
