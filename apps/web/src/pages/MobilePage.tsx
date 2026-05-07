import { Trash2, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getBaseResult, isJoyPoint } from '@roadmap/shared';
import { api, login, setToken } from '../api.js';
import { DicePicker } from '../components/DicePicker.js';
import { useCurrentGame, useSession } from '../hooks.js';

export function MobilePage() {
  const session = useSession('operator');
  const { state, connected, refresh } = useCurrentGame(Boolean(session.role));
  const [pin, setPin] = useState('');
  const [dice1, setDice1] = useState<number | null>(null);
  const [dice2, setDice2] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const preview = useMemo(() => {
    if (!dice1 || !dice2 || !state?.game) return null;
    const baseResult = getBaseResult(dice1, dice2);
    const joy = isJoyPoint(dice1, dice2, state.game);
    return { baseResult, joy };
  }, [dice1, dice2, state?.game]);

  async function handleLogin() {
    try {
      const data = await login(pin);
      setToken(data.token, 'operator');
      session.setRole(data.role);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登录失败');
    }
  }

  async function submitRound(mode: 'create' | 'update') {
    if (!dice1 || !dice2 || !connected) return;
    try {
      await api(mode === 'create' ? '/api/rounds' : '/api/rounds/last', {
        method: mode === 'create' ? 'POST' : 'PATCH',
        body: JSON.stringify({ dice1, dice2 })
      }, 'operator');
      setDice1(null);
      setDice2(null);
      setMessage(mode === 'create' ? '已录入' : '上一局已修改');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    }
  }

  async function deleteLast() {
    if (!confirm('确认删除上一局路单数据？')) return;
    try {
      await api('/api/rounds/last', { method: 'DELETE' }, 'operator');
      setMessage('上一局已删除');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败');
    }
  }

  if (session.checking) return <div className="mobile-screen center">恢复登录中...</div>;

  if (!session.role) {
    return (
      <div className="mobile-screen login-card">
        <h1>路单操作端</h1>
        <input value={pin} onChange={(event) => setPin(event.target.value)} placeholder="请输入 PIN" inputMode="numeric" type="password" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        <button className="primary-button" onClick={handleLogin}>登录</button>
        {message && <p className="error-text">{message}</p>}
        <a className="text-link" href="/admin" style={{ textAlign: 'center' }}>前往管理端</a>
      </div>
    );
  }

  if (!state?.game) {
    return (
      <div className="mobile-screen">
        <h1>当前没有进行中的游戏</h1>
        {session.role === 'admin' ? <CreateGame onDone={refresh} /> : <p className="muted">请联系管理员创建新游戏</p>}
      </div>
    );
  }

  const latest = state.rounds.at(-1);
  const paused = state.game.status === 'paused';
  const opDisabled = !connected || paused;

  return (
    <div className="mobile-screen">
      <header className="mobile-header">
        <strong>{state.game.name}</strong>
        <span style={{ color: paused ? 'var(--joy)' : undefined }}>
          {paused ? '已暂停' : connected ? '已连接' : '连接断开'}
        </span>
      </header>
      {paused && <p className="paused-banner">游戏已暂停，请等待管理员恢复</p>}
      <div className="mobile-summary">
        <span>下一局：第 {state.nextRoundNo} 局</span>
        <span>欢乐点：{state.game.joyPointEnabled ? `${state.game.joyDice1}+${state.game.joyDice2}` : '未启用'}</span>
      </div>

      <DicePicker label="骰子 1" value={dice1} onChange={setDice1} disabled={opDisabled} />
      <DicePicker label="骰子 2" value={dice2} onChange={setDice2} disabled={opDisabled} />

      <section className="preview-box">
        <span>预览</span>
        <strong>{dice1 && dice2 ? `${dice1} + ${dice2}` : '请选择两个骰子'}</strong>
        <small>{preview ? `${preview.joy ? '欢乐点 / ' : ''}${preview.baseResult}` : '-'}</small>
      </section>

      <button className="primary-button sticky-action" disabled={!dice1 || !dice2 || opDisabled} onClick={() => submitRound('create')}>确认录入</button>

      <section className="last-round">
        <div>上一局：{latest ? `第${latest.roundNo}局 ${latest.dice1}+${latest.dice2} ${latest.isJoyPoint ? '欢乐点' : latest.baseResult}` : '暂无'}</div>
        <div className="button-row">
          <button disabled={!latest || !dice1 || !dice2 || opDisabled} onClick={() => submitRound('update')}><Wrench size={16} />修改上一局</button>
          <button className="danger" disabled={!latest || opDisabled} onClick={deleteLast}><Trash2 size={16} />删除上一局</button>
        </div>
      </section>

      <a className="text-link" href="/admin" style={{ textAlign: 'center' }}>管理端</a>
      {message && <p className="message-text">{message}</p>}
    </div>
  );
}

function CreateGame({ onDone }: { onDone: () => Promise<void> }) {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [joyDice1, setJoyDice1] = useState<number | null>(null);
  const [joyDice2, setJoyDice2] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  async function create() {
    try {
      await api('/api/games', {
        method: 'POST',
        body: JSON.stringify({ name, joyPointEnabled: enabled, joyDice1, joyDice2 })
      }, 'operator');
      await onDone();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '创建失败');
    }
  }

  return (
    <section className="create-game">
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="游戏名称，可不填" />
      <label className="switch-line"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />启用欢乐点</label>
      {enabled && (
        <>
          <DicePicker label="欢乐点骰子 A" value={joyDice1} onChange={setJoyDice1} />
          <DicePicker label="欢乐点骰子 B" value={joyDice2} onChange={setJoyDice2} />
        </>
      )}
      <button className="primary-button" onClick={create} disabled={enabled && (!joyDice1 || !joyDice2)}>开始游戏</button>
      {message && <p className="error-text">{message}</p>}
    </section>
  );
}
