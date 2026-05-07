export type BaseResult = '单' | '双';
export type GameStatus = 'active' | 'ended';
export type Role = 'operator' | 'admin';

export type Game = {
  id: number;
  name: string;
  status: GameStatus;
  joyPointEnabled: boolean;
  joyDice1: number | null;
  joyDice2: number | null;
  startedAt: string;
  endedAt: string | null;
};

export type Round = {
  id: number;
  gameId: number;
  roundNo: number;
  dice1: number;
  dice2: number;
  baseResult: BaseResult;
  isJoyPoint: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type Stats = {
  total: number;
  singles: number;
  doubles: number;
  joyPoints: number;
  singleRate: number;
  doubleRate: number;
  currentStreak: { result: BaseResult | null; count: number };
  longestSingleStreak: number;
  longestDoubleStreak: number;
};

export type CurrentGameState = {
  game: Game | null;
  rounds: Round[];
  stats: Stats;
  nextRoundNo: number | null;
};
