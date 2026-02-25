import type { BeatNote, NoteType } from "./beatmapLoader";
import type { InputMode } from "./inputHandler";

const TIMING_WINDOW_MS = 200;

export class RhythmConductor {
  private beatmap: BeatNote[] = [];
  private currentNote = 0;

  onNoteHit: ((noteIndex: number, zone: number, offsetMs: number, type: NoteType) => void) | null = null;
  onNoteMissed: ((noteIndex: number, zone: number, type: NoteType) => void) | null = null;
  onTrackCompleted: (() => void) | null = null;
  onModeChange: ((mode: InputMode) => void) | null = null;

  private lastEmittedMode: InputMode | null = null;

  load(beatmap: BeatNote[]): void {
    this.beatmap = beatmap;
    this.currentNote = 0;
    this.lastEmittedMode = null;
  }

  reset(): void {
    this.currentNote = 0;
    this.lastEmittedMode = null;
  }

  update(playbackMs: number): void {
    while (this.currentNote < this.beatmap.length) {
      const note = this.beatmap[this.currentNote];
      const diff = playbackMs - note.time_ms;

      if (diff > TIMING_WINDOW_MS) {
        this.onNoteMissed?.(this.currentNote, note.zone, note.type);
        this.currentNote++;
      } else {
        break;
      }
    }

    // Уведомляем о смене режима при приближении к следующей ноте
    if (this.currentNote < this.beatmap.length) {
      const nextMode = this.beatmap[this.currentNote].type as InputMode;
      if (nextMode !== this.lastEmittedMode) {
        this.lastEmittedMode = nextMode;
        this.onModeChange?.(nextMode);
      }
    }

    if (this.currentNote >= this.beatmap.length) {
      this.onTrackCompleted?.();
    }
  }

  tryHit(zone: number, playbackMs: number, mode: InputMode): boolean {
    if (this.currentNote >= this.beatmap.length) return false;

    const note = this.beatmap[this.currentNote];
    const offset = playbackMs - note.time_ms;

    if (Math.abs(offset) <= TIMING_WINDOW_MS && zone === note.zone && mode === note.type) {
      this.onNoteHit?.(this.currentNote, note.zone, offset, note.type);
      this.currentNote++;
      return true;
    }
    return false;
  }

  getCurrentNote(): BeatNote | null {
    if (this.currentNote >= this.beatmap.length) return null;
    return this.beatmap[this.currentNote];
  }

  getProgress(): number {
    if (this.beatmap.length === 0) return 0;
    return this.currentNote / this.beatmap.length;
  }
}
