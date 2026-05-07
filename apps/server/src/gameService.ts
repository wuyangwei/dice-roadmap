import { calculateStats, type CurrentGameState, type Game } from '@roadmap/shared';
import { z } from 'zod';
import { db } from './db.js';
import { assertFound, HttpError } from './errors.js';
import { mapGame, mapRound } from './mappers.js';
import { createDefaultGameName, nowIsoSeconds } from './time.js';

export const createGameSchema = z.object({
  name: z.string().trim().optional(),
  joyPointEnabled: z.boolean(),
  joyDice1: z.number().int().min(1).max(6).nullable().optional(),
  joyDice2: z.number().int().min(1).max(6).nullable().optional()
});

export function getActiveGame(): Game | null {
  const row = db.prepare("SELECT * FROM games WHERE status = 'active' ORDER BY id DESC LIMIT 1").get();
  return row ? mapGame(row) : null;
}

export function getRoundsByGame(gameId: number) {
  return (db.prepare('SELECT * FROM rounds WHERE game_id = ? ORDER BY round_no ASC').all(gameId) as any[]).map(mapRound);
}

export function getCurrentGameState(): CurrentGameState {
  const game = getActiveGame();
  if (!game) {
    return { game: null, rounds: [], stats: calculateStats([]), nextRoundNo: null };
  }

  const rounds = getRoundsByGame(game.id);
  return {
    game,
    rounds,
    stats: calculateStats(rounds),
    nextRoundNo: rounds.length ? Math.max(...rounds.map((round) => round.roundNo)) + 1 : 1
  };
}

export function createGame(input: z.infer<typeof createGameSchema>): Game {
  const parsed = createGameSchema.parse(input);
  if (getActiveGame()) throw new HttpError(409, '已有进行中的游戏，请先结束当前游戏');
  if (parsed.joyPointEnabled && (!parsed.joyDice1 || !parsed.joyDice2)) {
    throw new HttpError(400, '启用欢乐点时必须选择两个骰子点数');
  }

  const result = db.prepare(`
    INSERT INTO games (name, status, joy_point_enabled, joy_dice_1, joy_dice_2, started_at)
    VALUES (?, 'active', ?, ?, ?, ?)
  `).run(
    parsed.name || createDefaultGameName(),
    parsed.joyPointEnabled ? 1 : 0,
    parsed.joyPointEnabled ? parsed.joyDice1 : null,
    parsed.joyPointEnabled ? parsed.joyDice2 : null,
    nowIsoSeconds()
  );

  const created = assertFound(db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid), '创建游戏失败');
  return mapGame(created);
}

export function endGame(gameId: number): Game {
  const game = mapGame(assertFound(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId), '游戏不存在'));
  if (game.status !== 'active') throw new HttpError(400, '游戏已经结束');

  db.prepare("UPDATE games SET status = 'ended', ended_at = ? WHERE id = ?").run(nowIsoSeconds(), gameId);
  return mapGame(assertFound(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)));
}

export function listGames() {
  const rows = db.prepare('SELECT * FROM games ORDER BY started_at DESC').all() as any[];
  return rows.map((row) => {
    const game = mapGame(row);
    const rounds = getRoundsByGame(game.id);
    return { game, stats: calculateStats(rounds) };
  });
}

export function getGameDetail(gameId: number) {
  const game = mapGame(assertFound(db.prepare('SELECT * FROM games WHERE id = ?').get(gameId), '游戏不存在'));
  const rounds = getRoundsByGame(gameId);
  return { game, rounds, stats: calculateStats(rounds) };
}
