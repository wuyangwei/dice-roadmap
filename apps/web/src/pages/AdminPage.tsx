import { useState } from 'react';
import type { Game, Round, Stats } from '@roadmap/shared';
import { api, endGameById, login, pauseGame, resumeGame, setToken } from '../api.js';
import { BeadRoad } from '../components/BeadRoad.js';
import { BigRoad } from '../components/BigRoad.js';
import { useCurrentGame, useSession } from '../hooks.js';

type GameListItem = { game: Game; stats: Stats };
type GameDetail = { game: Game; rounds: Round[]; stats: Stats };

export function AdminPage() {
  const session = useSession('admin');
  const { state: currentState, refresh: refreshCurrent } = useCurrentGame(session.role === 'admin');
  const [items, setItems] = useState<GameListItem[]>([]);
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [error, setError] = useState('');
  const [ctrlMsg, setCtrlMsg] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  async function handleLogin() {
    try {
      const data = await login(pin);
      if (data.role !== 'admin') {
        setLoginError('该 PIN 不是管理员权限');
        return;
      }
      setToken(data.token, 'admin');
      session.setRole(data.role);
      setLoginError('');
      loadGames();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '登录失败');
    }
  }

  async function loadGames() {
    try {
      const data = await api<GameListItem[]>('/api/games', {}, 'admin');
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }

  async function openDetail(id: number) {
    setDetail(await api<GameDetail>(`/api/games/${id}`, {}, 'admin'));
  }

  async function handlePause() {
    if (!currentState?.game) return;
    try {
      await pauseGame(currentState.game.id);
      await refreshCurrent();
      setCtrlMsg('');
    } catch (err) {
      setCtrlMsg(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function handleResume() {
    if (!currentState?.game) return;
    try {
      await resumeGame(currentState.game.id);
      await refreshCurrent();
      setCtrlMsg('');
    } catch (err) {
      setCtrlMsg(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function handleEnd() {
    if (!currentState?.game) return;
    if (!confirm(`确认结束「${currentState.game.name}」？结束后无法继续录入。`)) return;
    try {
      await endGameById(currentState.game.id);
      await refreshCurrent();
      await loadGames();
      setCtrlMsg('');
    } catch (err) {
      setCtrlMsg(err instanceof Error ? err.message : '操作失败');
    }
  }

  if (session.checking) return <div className="screen center">恢复登录中...</div>;

  if (session.role !== 'admin') {
    return (
      <div className="screen center">
        <div className="login-card">
          <h1>管理员登录</h1>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="请输入管理员 PIN"
            inputMode="numeric"
            type="password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button className="primary-button" onClick={handleLogin}>登录</button>
          {loginError && <p className="error-text">{loginError}</p>}
          <a className="text-link" href="/mobile">切换到操作端</a>
        </div>
      </div>
    );
  }

  const cg = currentState?.game;

  return (
    <div className="screen admin-page">
      <header className="topbar">
        <h1>管理后台</h1>
        <a className="text-link" href="/mobile">操作端</a>
      </header>

      {/* 当前游戏控制面板 */}
      <section className="current-game-panel">
        {cg ? (
          <>
            <div className="current-game-info">
              <span className="current-game-name">{cg.name}</span>
              <span className={`game-status-badge status-${cg.status}`}>
                {cg.status === 'active' ? '进行中' : cg.status === 'paused' ? '已暂停' : '已结束'}
              </span>
              <span className="muted">共 {currentState?.stats.total ?? 0} 局</span>
            </div>
            {cg.status !== 'ended' && (
              <div className="current-game-actions">
                {cg.status === 'active'
                  ? <button className="ctrl-btn pause" onClick={handlePause}>暂停</button>
                  : <button className="ctrl-btn resume" onClick={handleResume}>恢复</button>
                }
                <button className="ctrl-btn end" onClick={handleEnd}>结束游戏</button>
              </div>
            )}
            {ctrlMsg && <p className="error-text" style={{ margin: '6px 0 0' }}>{ctrlMsg}</p>}
          </>
        ) : (
          <span className="muted">当前没有进行中的游戏</span>
        )}
      </section>

      {error && <p className="error-text">{error}</p>}
      {items.length === 0 && (
        <div className="center" style={{ marginTop: '2rem' }}>
          <button className="primary-button" onClick={loadGames}>加载游戏列表</button>
        </div>
      )}
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
