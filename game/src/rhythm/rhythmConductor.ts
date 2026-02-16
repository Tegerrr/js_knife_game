import type { BeatNote } from "./beatmapLoader";

const TIMING_WINDOW_MS = 200;

export class RhythmConductor {
  private beatmap: BeatNote[] = [];
  private currentNote = 0;

  onNoteHit: ((noteIndex: number, zone: number, offsetMs: number) => void) | null = null;
  onNoteMissed: ((noteIndex: number, zone: number) => void) | null = null;
  onTrackCompleted: (() => void) | null = null;

  load(beatmap: BeatNote[]): void {
    this.beatmap = beatmap;
    this.currentNote = 0;
  }

  reset(): void {
    this.currentNote = 0;
  }

  update(playbackMs: number): void {
    while (this.currentNote < this.beatmap.length) {
      const note = this.beatmap[this.currentNote];
      const diff = playbackMs - note.time_ms;

      if (diff > TIMING_WINDOW_MS) {
        // Note was missed — past the timing window
        this.onNoteMissed?.(this.currentNote, note.zone);
        this.currentNote++;
      } else {
        break;
      }
    }

    if (this.currentNote >= this.beatmap.length) {
      this.onTrackCompleted?.();
    }
  }

  tryHit(zone: number, playbackMs: number): boolean {
    if (this.currentNote >= this.beatmap.length) return false;

    const note = this.beatmap[this.currentNote];
    const offset = playbackMs - note.time_ms;

    if (Math.abs(offset) <= TIMING_WINDOW_MS && zone === note.zone) {
      this.onNoteHit?.(this.currentNote, note.zone, offset);
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
