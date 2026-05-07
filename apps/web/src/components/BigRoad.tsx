import { buildBigRoad, type Round } from '@roadmap/shared';
import { useEffect, useRef, useState } from 'react';
import { RoadCell } from './RoadCell.js';

const CELL_GAP = 6; // 与 CSS gap 保持一致

export function BigRoad({ rounds }: { rounds: Round[] }) {
  const cells = buildBigRoad(rounds);
  const contentCols = Math.max(1, ...cells.map((cell) => cell.col + 1));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleCols, setVisibleCols] = useState(0);

  // 监听容器宽度，计算能放下几列
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
      setVisibleCols(Math.floor((el.clientWidth + CELL_GAP) / (cellSize + CELL_GAP)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 内容超出容器时滚到最右
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (contentCols > visibleCols) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [rounds, contentCols, visibleCols]);

  const cols = Math.max(contentCols, visibleCols);

  return (
    <div className="road-scroll big-road" ref={scrollRef}>
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
