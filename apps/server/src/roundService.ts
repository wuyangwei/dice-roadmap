import { assertDice, getBaseResult, isJoyPoint } from '@roadmap/shared';
import { z } from 'zod';
import { db } from './db.js';
import { assertFound, HttpError } from './errors.js';
import { getActiveGame } from './gameService.js';
import { mapRound } from './mappers.js';
import { nowIsoSeconds } from './time.js';

export const roundInputSchema = z.object({
  dice1: z.number().int().min(1).max(6),
  dice2: z.number().int().min(1).max(6)
});

export function createRound(input: z.infer<typeof roundInputSchema>) {
  const parsed = roundInputSchema.parse(input);
  assertDice(parsed.dice1);
  assertDice(parsed.dice2);

  const game = getActiveGame();
  if (!game) throw new HttpError(400, '当前没有进行中的游戏');
  if (game.status === 'paused') throw new HttpError(400, '游戏已暂停，无法录入');

  const maxRow = db.prepare('SELECT MAX(round_no) AS max_round_no FROM rounds WHERE game_id = ?').get(game.id) as { max_round_no: number | null };
  const roundNo = (maxRow.max_round_no ?? 0) + 1;
  const baseResult = getBaseResult(parsed.dice1, parsed.dice2);
  const joy = isJoyPoint(parsed.dice1, parsed.dice2, game);

  const result = db.prepare(`
    INSERT INTO rounds (game_id, round_no, dice_1, dice_2, base_result, is_joy_point, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(game.id, roundNo, parsed.dice1, parsed.dice2, baseResult, joy ? 1 : 0, nowIsoSeconds());

  return mapRound(assertFound(db.prepare('SELECT * FROM rounds WHERE id = ?').get(result.lastInsertRowid), '录入失败'));
}

export function updateLastRound(input: z.infer<typeof roundInputSchema>) {
  const parsed = roundInputSchema.parse(input);
  const game = getActiveGame();
  if (!game) throw new HttpError(400, '当前没有进行中的游戏');
  if (game.status === 'paused') throw new HttpError(400, '游戏已暂停，无法修改');

  const last = assertFound(
    db.prepare('SELECT * FROM rounds WHERE game_id = ? ORDER BY round_no DESC LIMIT 1').get(game.id),
    '没有可修改的上一局'
  );

  const baseResult = getBaseResult(parsed.dice1, parsed.dice2);
  const joy = isJoyPoint(parsed.dice1, parsed.dice2, game);

  db.prepare(`
    UPDATE rounds
    SET dice_1 = ?, dice_2 = ?, base_result = ?, is_joy_point = ?, updated_at = ?
    WHERE id = ?
  `).run(parsed.dice1, parsed.dice2, baseResult, joy ? 1 : 0, nowIsoSeconds(), (last as any).id);

  return mapRound(assertFound(db.prepare('SELECT * FROM rounds WHERE id = ?').get((last as any).id), '修改失败'));
}

export function deleteLastRound() {
  const game = getActiveGame();
  if (!game) throw new HttpError(400, '当前没有进行中的游戏');
  if (game.status === 'paused') throw new HttpError(400, '游戏已暂停，无法删除');

  const last = assertFound(
    db.prepare('SELECT * FROM rounds WHERE game_id = ? ORDER BY round_no DESC LIMIT 1').get(game.id),
    '没有可删除的上一局'
  );

  db.prepare('DELETE FROM rounds WHERE id = ?').run((last as any).id);
  return mapRound(last);
}
