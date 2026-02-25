const STAB_KEYS: Record<string, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
};

const TRICK_KEYS: Record<string, number> = {
  "q": 0, "Q": 0,
  "w": 1, "W": 1,
  "e": 2, "E": 2,
  "r": 3, "R": 3,
  "t": 4, "T": 4,
};

export type InputMode = "stab" | "trick";

export class InputHandler {
  onZonePressed: ((zoneIndex: number, mode: InputMode) => void) | null = null;
  private active = false;
  private mode: InputMode = "stab";
  private readonly handleKeyDown: (e: KeyboardEvent) => void;

  constructor() {
    this.handleKeyDown = (e: KeyboardEvent) => {
      if (!this.active) return;

      if (this.mode === "stab") {
        const zone = STAB_KEYS[e.key];
        if (zone !== undefined) {
          this.onZonePressed?.(zone, "stab");
        }
      } else {
        const zone = TRICK_KEYS[e.key];
        if (zone !== undefined) {
          this.onZonePressed?.(zone, "trick");
        }
      }
    };
    window.addEventListener("keydown", this.handleKeyDown);
  }

  setMode(mode: InputMode): void {
    this.mode = mode;
  }

  getMode(): InputMode {
    return this.mode;
  }

  start(): void {
    this.active = true;
  }

  stop(): void {
    this.active = false;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}
