import type { Round } from '@roadmap/shared';

export function RoadCell({ round, compact = false }: { round: Round; compact?: boolean }) {
  const className = `road-cell ${round.isJoyPoint ? 'joy' : round.baseResult === '单' ? 'single' : 'double'}`;
  return (
    <div className={className} title={`第${round.roundNo}局 ${round.dice1}+${round.dice2} ${round.isJoyPoint ? '欢乐点' : round.baseResult} ${round.createdAt}`}>
      <strong>{round.isJoyPoint ? '欢' : round.baseResult}</strong>
      {!compact && <span>{round.dice1}+{round.dice2}</span>}
    </div>
  );
}
