import type { BaseResult, Game } from './types.js';

export function getBaseResult(dice1: number, dice2: number): BaseResult {
  assertDice(dice1);
  assertDice(dice2);
  return (dice1 + dice2) % 2 === 0 ? '双' : '单';
}

export function isJoyPoint(dice1: number, dice2: number, game: Pick<Game, 'joyPointEnabled' | 'joyDice1' | 'joyDice2'>): boolean {
  assertDice(dice1);
  assertDice(dice2);
  if (!game.joyPointEnabled || !game.joyDice1 || !game.joyDice2) return false;

  return (
    (dice1 === game.joyDice1 && dice2 === game.joyDice2) ||
    (dice1 === game.joyDice2 && dice2 === game.joyDice1)
  );
}

export function assertDice(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    throw new Error('骰子点数必须是 1-6 的整数');
  }
}
