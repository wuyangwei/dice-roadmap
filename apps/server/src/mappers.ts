import type { Game, Round } from '@roadmap/shared';

export function mapGame(row: any): Game {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    joyPointEnabled: Boolean(row.joy_point_enabled),
    joyDice1: row.joy_dice_1,
    joyDice2: row.joy_dice_2,
    startedAt: row.started_at,
    endedAt: row.ended_at
  };
}

export function mapRound(row: any): Round {
  return {
    id: row.id,
    gameId: row.game_id,
    roundNo: row.round_no,
    dice1: row.dice_1,
    dice2: row.dice_2,
    baseResult: row.base_result,
    isJoyPoint: Boolean(row.is_joy_point),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
