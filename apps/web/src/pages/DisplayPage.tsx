import { QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BeadRoad } from '../components/BeadRoad.js';
import { BigRoad } from '../components/BigRoad.js';
import { StatsPanel } from '../components/StatsPanel.js';
import { useCurrentGame } from '../hooks.js';

export function DisplayPage() {
  const { state, connected, error } = useCurrentGame(true);
  const [network, setNetwork] = useState<{ mobileUrl: string; qrCode: string } | null>(null);

  useEffect(() => {
    fetch('/api/network').then((res) => res.json()).then(setNetwork).catch(() => undefined);
  }, []);

  if (!state) return <div className="screen center">{error ?? '加载中...'}</div>;

  if (!state.game) {
    return (
      <div className="screen empty-state">
        <h1>当前没有进行中的游戏</h1>
        <p>请使用管理员手机端创建新游戏</p>
        {network && <img className="qr-large" src={network.qrCode} alt="手机端二维码" />}
        <span>{network?.mobileUrl}</span>
      </div>
    );
  }

  const latest = state.rounds.at(-1);

  return (
    <div className="screen display-layout">
      <header className="topbar">
        <div>
          <h1>{state.game.name}</h1>
          <span className="muted">{connected ? '实时连接' : '连接断开'} · 进行中 · 已开 {state.stats.total} 局</span>
        </div>
        <div className="qr-chip">
          <QrCode size={18} />
          <span>{network?.mobileUrl ?? '手机端地址加载中'}</span>
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

      <footer className="footerbar">
        {latest ? `最近记录：第${latest.roundNo}局 ${latest.dice1}+${latest.dice2} ${latest.isJoyPoint ? '欢乐点' : latest.baseResult} ${latest.createdAt}` : '暂无记录'}
      </footer>
    </div>
  );
}
