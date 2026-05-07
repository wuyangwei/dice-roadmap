import type { CurrentGameState } from '@roadmap/shared';

export function StatsPanel({ state }: { state: CurrentGameState }) {
  const { game, stats, nextRoundNo } = state;
  return (
    <aside className="stats-panel">
      <section className="info-box joy-box">
        <span>欢乐点</span>
        <strong>{game?.joyPointEnabled ? `${game.joyDice1} + ${game.joyDice2}` : '未启用'}</strong>
        <small>已出 {stats.joyPoints} 次</small>
      </section>
      <section className="info-box">
        <span>下一局</span>
        <strong>{nextRoundNo ? `第 ${nextRoundNo} 局` : '-'}</strong>
      </section>
      <section className="stat-list">
        <Row label="总局数" value={stats.total} />
        <Row label="单" value={`${stats.singles} (${percent(stats.singleRate)})`} />
        <Row label="双" value={`${stats.doubles} (${percent(stats.doubleRate)})`} />
        <Row label="当前连续" value={stats.currentStreak.result ? `${stats.currentStreak.result} ${stats.currentStreak.count}` : '-'} />
        <Row label="最长连单" value={stats.longestSingleStreak} />
        <Row label="最长连双" value={stats.longestDoubleStreak} />
      </section>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
