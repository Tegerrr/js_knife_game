export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicStartTime = 0;
  private playing = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async loadTrack(url: string): Promise<void> {
    const ctx = this.getCtx();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.musicBuffer = await ctx.decodeAudioData(arrayBuffer);
  }

  play(): void {
    if (!this.musicBuffer || this.playing) return;
    const ctx = this.getCtx();
    this.musicSource = ctx.createBufferSource();
    this.musicSource.buffer = this.musicBuffer;
    this.musicSource.connect(ctx.destination);
    this.musicSource.start();
    this.musicStartTime = ctx.currentTime;
    this.playing = true;
    this.musicSource.onended = () => {
      this.playing = false;
    };
  }

  stop(): void {
    if (this.musicSource && this.playing) {
      this.musicSource.stop();
      this.musicSource = null;
      this.playing = false;
    }
  }

  getPlaybackMs(): number {
    if (!this.playing) return 0;
    const ctx = this.getCtx();
    return (ctx.currentTime - this.musicStartTime) * 1000;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  playHit(): void {
    this.playTone(520, 0.08, 0.3);
  }

  playMiss(): void {
    this.playTone(180, 0.15, 0.4);
  }

  private playTone(freq: number, duration: number, volume: number): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
}
