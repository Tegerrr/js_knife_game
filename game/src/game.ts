import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { setupEnvironment } from "./scenes/environment";
import { GameCamera } from "./scenes/gameCamera";
import { Table } from "./scenes/table";
import { Knife } from "./scenes/knife";

import { loadBeatmap } from "./rhythm/beatmapLoader";
import { RhythmConductor } from "./rhythm/rhythmConductor";
import { InputHandler } from "./rhythm/inputHandler";

import { AudioManager } from "./managers/audioManager";
import { GameManager } from "./managers/gameManager";

import { HUD } from "./ui/hud";
import { ResultScreen } from "./ui/resultScreen";

const GREEN = new Color3(0.1, 1, 0.2);
const RED = new Color3(1, 0.15, 0.1);

export class Game {
  private engine: Engine;
  private scene: Scene;
  private camera: GameCamera;
  private table: Table;
  private knife: Knife;
  private conductor: RhythmConductor;
  private input: InputHandler;
  private audio: AudioManager;
  private manager: GameManager;
  private hud: HUD;
  private resultScreen: ResultScreen;
  private trackCompleted = false;

  constructor(engine: Engine) {
    this.engine = engine;
    this.scene = new Scene(engine);
    this.camera = new GameCamera(this.scene);
    setupEnvironment(this.scene);
    this.table = new Table(this.scene);
    this.knife = new Knife(this.scene);

    this.conductor = new RhythmConductor();
    this.input = new InputHandler();
    this.audio = new AudioManager();
    this.manager = new GameManager();
    this.hud = new HUD();
    this.resultScreen = new ResultScreen();

    this.wireEvents();
    this.registerUpdateLoop();
  }

  private wireEvents(): void {
    // Input → try hit
    this.input.onZonePressed = (zone) => {
      const playbackMs = this.audio.getPlaybackMs();
      const hit = this.conductor.tryHit(zone, playbackMs);
      if (!hit) {
        // Wrong zone or bad timing — visual feedback only
        this.knife.moveToZone(zone);
      }
    };

    // Hit
    this.conductor.onNoteHit = (_noteIndex, zone, _offsetMs) => {
      this.manager.addScore();
      this.knife.moveToZone(zone);
      this.knife.stab();
      this.table.flashZone(zone, GREEN);
      this.audio.playHit();
    };

    // Miss
    this.conductor.onNoteMissed = (_noteIndex, zone) => {
      this.manager.addMiss();
      this.table.flashZone(zone, RED);
      this.camera.shake();
      this.audio.playMiss();
    };

    // Track complete
    this.conductor.onTrackCompleted = () => {
      if (this.trackCompleted) return;
      this.trackCompleted = true;
      this.input.stop();
      this.manager.endGame();
      this.resultScreen.showResults(this.manager.score, this.manager.misses, this.manager.totalNotes);
    };

    // Score/misses → HUD
    this.manager.onScoreChanged = (score) => this.hud.updateScore(score);
    this.manager.onMissChanged = (misses) => this.hud.updateMisses(misses);

    // Restart
    this.resultScreen.onRestart = () => this.start();
  }

  private registerUpdateLoop(): void {
    this.scene.onBeforeRenderObservable.add(() => {
      const deltaS = this.engine.getDeltaTime() / 1000;

      if (this.audio.isPlaying()) {
        const playbackMs = this.audio.getPlaybackMs();
        this.conductor.update(playbackMs);
        this.hud.updateProgress(this.conductor.getProgress());

        // Highlight upcoming zone
        const next = this.conductor.getCurrentNote();
        if (next) {
          this.table.highlightZone(next.zone);
        }
      }

      this.camera.update(deltaS);
      this.table.update(deltaS);
      this.knife.update(deltaS);
    });
  }

  async start(): Promise<void> {
    this.trackCompleted = false;
    this.resultScreen.hide();

    // Load assets
    const [beatmap] = await Promise.all([
      loadBeatmap("/assets/beatmaps/track_beatmap.json"),
      this.audio.loadTrack("/assets/audio/music/track.ogg"),
    ]);

    this.conductor.load(beatmap);
    this.conductor.reset();
    this.manager.startGame(beatmap.length);
    this.hud.show();
    this.audio.play();
    this.input.start();
  }

  getScene(): Scene {
    return this.scene;
  }
}
