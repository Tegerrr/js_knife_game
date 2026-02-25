export const GameState = {
	MENU: 0,
	PLAYING: 1,
	RESULTS: 2,
	GAME_OVER: 3,
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export interface RoundConfig {
	quota: number;
	hitReward: number;
	trickReward: number;
	maxMisses: number;
}

export const ROUND_CONFIGS: RoundConfig[] = [
	{ quota: 300,  hitReward: 10, trickReward: 25, maxMisses: 10 },
	{ quota: 500,  hitReward: 10, trickReward: 25, maxMisses: 10 },
	{ quota: 700,  hitReward: 10, trickReward: 25, maxMisses: 10 },
	{ quota: 1000, hitReward: 10, trickReward: 25, maxMisses: 10 },
];

export type GameOverReason = "misses" | "quota";

export class GameManager {
	state: GameState = GameState.MENU;
	money = 0;
	misses = 0;
	totalNotes = 0;
	roundIndex = 0;

	onMoneyChanged: ((money: number) => void) | null = null;
	onMissChanged: ((misses: number, max: number) => void) | null = null;
	onStateChanged: ((state: GameState) => void) | null = null;
	onGameOver: ((reason: GameOverReason) => void) | null = null;

	get config(): RoundConfig {
		return ROUND_CONFIGS[this.roundIndex];
	}

	startGame(totalNotes: number): void {
		this.money = 0;
		this.misses = 0;
		this.totalNotes = totalNotes;
		this.state = GameState.PLAYING;
		this.onStateChanged?.(this.state);
		this.onMoneyChanged?.(this.money);
		this.onMissChanged?.(this.misses, this.config.maxMisses);
	}

	addHit(): void {
		this.money += this.config.hitReward;
		this.onMoneyChanged?.(this.money);
	}

	addTrick(): void {
		this.money += this.config.trickReward;
		this.onMoneyChanged?.(this.money);
	}

	addMiss(): void {
		this.misses++;
		this.onMissChanged?.(this.misses, this.config.maxMisses);
		if (this.misses >= this.config.maxMisses) {
			this.triggerGameOver("misses");
		}
	}

	checkQuota(): boolean {
		return this.money >= this.config.quota;
	}

	endRound(): void {
		if (!this.checkQuota()) {
			this.triggerGameOver("quota");
			return;
		}
		this.state = GameState.RESULTS;
		this.onStateChanged?.(this.state);
	}

	private triggerGameOver(reason: GameOverReason): void {
		this.state = GameState.GAME_OVER;
		this.onStateChanged?.(this.state);
		this.onGameOver?.(reason);
	}

	nextRound(): void {
		this.roundIndex = Math.min(this.roundIndex + 1, ROUND_CONFIGS.length - 1);
	}

	reset(): void {
		this.money = 0;
		this.misses = 0;
		this.roundIndex = 0;
		this.state = GameState.MENU;
		this.onStateChanged?.(this.state);
	}
}
