const ZONE_KEYS: Record<string, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
};

export class InputHandler {
  onZonePressed: ((zoneIndex: number) => void) | null = null;
  private active = false;
  private readonly handleKeyDown: (e: KeyboardEvent) => void;

  constructor() {
    this.handleKeyDown = (e: KeyboardEvent) => {
      if (!this.active) return;
      const zone = ZONE_KEYS[e.key];
      if (zone !== undefined) {
        this.onZonePressed?.(zone);
      }
    };
    window.addEventListener("keydown", this.handleKeyDown);
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
