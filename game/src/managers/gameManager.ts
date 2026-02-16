export const GameState = {
	MENU: 0,
	PLAYING: 1,
	RESULTS: 2,
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export class GameManager {
	state: GameState = GameState.MENU;
	score = 0;
	misses = 0;
	totalNotes = 0;

	onScoreChanged: ((score: number) => void) | null = null;
	onMissChanged: ((misses: number) => void) | null = null;
	onStateChanged: ((state: GameState) => void) | null = null;

	startGame(totalNotes: number): void {
		this.score = 0;
		this.misses = 0;
		this.totalNotes = totalNotes;
		this.state = GameState.PLAYING;
		this.onStateChanged?.(this.state);
		this.onScoreChanged?.(this.score);
		this.onMissChanged?.(this.misses);
	}

	addScore(): void {
		this.score++;
		this.onScoreChanged?.(this.score);
	}

	addMiss(): void {
		this.misses++;
		this.onMissChanged?.(this.misses);
	}

	endGame(): void {
		this.state = GameState.RESULTS;
		this.onStateChanged?.(this.state);
	}

	reset(): void {
		this.score = 0;
		this.misses = 0;
		this.state = GameState.MENU;
		this.onStateChanged?.(this.state);
	}
}
