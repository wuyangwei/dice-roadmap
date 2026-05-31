import { useEffect, useState } from 'react';
import { useCurrentGame } from '../hooks.js';
import { BeadRoad } from '../components/BeadRoad.js';
import { BigRoad } from '../components/BigRoad.js';
import { StatsPanel } from '../components/StatsPanel.js';

function formatLocalTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function DisplayPage() {
  const { state, connected, error } = useCurrentGame(true);
  const clock = useClock();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('全屏请求失败:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!state) return <div className="screen center">{error ?? '加载中...'}</div>;

  if (!state.game) {
    return (
      <div className="screen empty-state">
        <h1>当前没有进行中的游戏</h1>
        <p>请使用管理员手机端创建新游戏</p>
      </div>
    );
  }

  const { game } = state;

  return (
    <div className="screen display-layout">
      <header className="topbar">
        <div>
          <h1>{game.name}</h1>
          <span className="muted">{connected ? '实时连接' : '连接断开'} · 已开 {state.stats.total} 局</span>
        </div>
        <div className="topbar-clock">{clock}</div>
        <div className="topbar-right">
          <div className="topbar-status">
            <span className={`game-status-badge status-${game.status}`}>
              {game.status === 'active' ? '进行中' : game.status === 'paused' ? '已暂停' : '已结束'}
            </span>
            {game.status === 'paused' && game.pausedAt && (
              <div className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>{formatLocalTime(game.pausedAt)}</div>
            )}
            {game.status === 'ended' && game.endedAt && (
              <div className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>{formatLocalTime(game.endedAt)}</div>
            )}
          </div>
          <button 
            className="fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? '退出全屏' : '全屏显示'}
          >
            {isFullscreen ? '✕ 退出全屏' : '⛶ 全屏'}
          </button>
        </div>
      </header>

      <main className="display-main">
        <section className="roads-area">
          <div className="road-section">
            <div className="section-title">珠盘路</div>
            <BeadRoad rounds={state.rounds} />
          </div>
          <div className="road-section">
            <div className="section-title">大路</div>
            <BigRoad rounds={state.rounds} />
          </div>
        </section>
        <StatsPanel state={state} />
      </main>
    </div>
  );
}
