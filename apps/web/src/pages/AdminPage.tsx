import { useEffect, useState } from 'react';
import type { Game, Round, Stats } from '@roadmap/shared';
import { api } from '../api.js';
import { BeadRoad } from '../components/BeadRoad.js';
import { BigRoad } from '../components/BigRoad.js';
import { useSession } from '../hooks.js';

type GameListItem = { game: Game; stats: Stats };
type GameDetail = { game: Game; rounds: Round[]; stats: Stats };

export function AdminPage() {
  const session = useSession();
  const [items, setItems] = useState<GameListItem[]>([]);
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session.role !== 'admin') return;
    api<GameListItem[]>('/api/games').then(setItems).catch((err) => setError(err.message));
  }, [session.role]);

  async function openDetail(id: number) {
    setDetail(await api<GameDetail>(`/api/games/${id}`));
  }

  if (session.checking) return <div className="screen center">恢复登录中...</div>;
  if (session.role !== 'admin') return <div className="screen center">请先在手机端使用管理员 PIN 登录</div>;

  return (
    <div className="screen admin-page">
      <header className="topbar">
        <h1>历史游戏</h1>
        <a className="text-link" href="/display">返回大屏</a>
      </header>
      {error && <p className="error-text">{error}</p>}
      <div className="admin-grid">
        <section className="game-list">
          {items.map((item) => (
            <button key={item.game.id} className="game-card" onClick={() => openDetail(item.game.id)}>
              <strong>{item.game.name}</strong>
              <span>{item.stats.total}局 | 单{item.stats.singles} 双{item.stats.doubles} | 欢乐点{item.stats.joyPoints}</span>
              <small>{item.game.startedAt} - {item.game.endedAt ?? '进行中'}</small>
            </button>
          ))}
        </section>
        <section className="admin-detail">
          {detail ? (
            <>
              <h2>{detail.game.name}</h2>
              <p className="muted">欢乐点：{detail.game.joyPointEnabled ? `${detail.game.joyDice1}+${detail.game.joyDice2}` : '未启用'}</p>
              <BeadRoad rounds={detail.rounds} />
              <BigRoad rounds={detail.rounds} />
              <table>
                <thead>
                  <tr><th>局号</th><th>骰子1</th><th>骰子2</th><th>结果</th><th>时间</th></tr>
                </thead>
                <tbody>
                  {detail.rounds.map((round) => (
                    <tr key={round.id}>
                      <td>{round.roundNo}</td>
                      <td>{round.dice1}</td>
                      <td>{round.dice2}</td>
                      <td>{round.isJoyPoint ? '欢乐点' : round.baseResult}</td>
                      <td>{round.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="center">选择一场游戏查看详情</div>
          )}
        </section>
      </div>
    </div>
  );
}
