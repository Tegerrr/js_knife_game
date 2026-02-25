import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { setupEnvironment } from "./scenes/environment";
import { GameCamera } from "./scenes/gameCamera";
import { Table } from "./scenes/table";
import { Knife } from "./scenes/knife";

import { loadBeatmap } from "./rhythm/beatmapLoader";
import type { BeatNote } from "./rhythm/beatmapLoader";
import { RhythmConductor } from "./rhythm/rhythmConductor";
import { InputHandler } from "./rhythm/inputHandler";

import { AudioManager } from "./managers/audioManager";
import { GameManager, GameState, ROUND_CONFIGS } from "./managers/gameManager";

import { HUD } from "./ui/hud";
import { ResultScreen } from "./ui/resultScreen";
import { GameOverScreen } from "./ui/gameOverScreen";
import { BreakScreen } from "./ui/breakScreen";
import { ChatOverlay } from "./ui/chatOverlay";

const GREEN = new Color3(0.1, 1, 0.2);
const RED = new Color3(1, 0.15, 0.1);
const GOLD = new Color3(1, 0.8, 0.1);

const BREAK_SCREENS = [
  // 0 — вступление, перед First Game
  {
    lines: [
      "You have a debt to pay.",
      "",
      "The camera is live.",
      "The chat is watching.",
      "",
      "Pick up the knife.",
      "Keys 1 – 2 – 3 – 4 – 5.",
      "Hit between the fingers. Don't miss.",
    ],
  },
  // 1 — после First Game, перед Second Game
  {
    lines: [
      "Not bad.",
      "",
      "The chat is excited. Donations coming in.",
      "",
      "But you need more.",
      "Learn the tricks.",
      "",
      "New keys: Q – W – E – R – T",
      "Watch the mode indicator.",
    ],
  },
  // 2 — после Second Game, перед Third Game
  {
    lines: [
      "The VIPs are sending gifts.",
      "",
      "A cigar. A bottle of whiskey.",
      "Give them a show between rounds.",
      "",
      "They pay more when you perform.",
    ],
  },
  // 3 — Dealer speech, перед Last Game
  {
    lines: [
      `"You've come a long way."`,
      "",
      `"One last game."`,
      `"All or nothing."`,
      "",
      "Everything you've learned.",
      "Everything. At once.",
      "",
      "Don't.  Miss.",
    ],
  },
];

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
  private gameOverScreen: GameOverScreen;
  private breakScreen: BreakScreen;

  private chat: ChatOverlay;
  private trackCompleted = false;
  private beatmap: BeatNote[] | null = null;

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
    this.gameOverScreen = new GameOverScreen();
    this.breakScreen = new BreakScreen();
    this.chat = new ChatOverlay();

    this.wireEvents();
    this.registerUpdateLoop();
  }

  private wireEvents(): void {
    this.input.onZonePressed = (zone, mode) => {
      const playbackMs = this.audio.getPlaybackMs();
      const hit = this.conductor.tryHit(zone, playbackMs, mode);
      if (!hit) {
        this.knife.moveToZone(zone);
      }
    };

    this.conductor.onModeChange = (mode) => {
      this.input.setMode(mode);
      this.hud.updateMode(mode === "stab" ? "STAB  [1-5]" : "TRICK [Q-T]");
    };

    this.conductor.onNoteHit = (_i, zone, _off, type) => {
      if (type === "trick") {
        this.manager.addTrick();
      } else {
        this.manager.addHit();
      }
      this.knife.moveToZone(zone);
      this.knife.stab();
      this.table.flashZone(zone, type === "trick" ? GOLD : GREEN);
      this.audio.playHit();
    };

    this.conductor.onNoteMissed = (_i, zone) => {
      this.manager.addMiss();
      this.table.flashZone(zone, RED);
      this.camera.shake();
      this.audio.playMiss();
    };

    this.conductor.onTrackCompleted = () => {
      if (this.trackCompleted) return;
      this.trackCompleted = true;
      this.input.stop();
      this.audio.stop();
      this.manager.endRound();
    };

    this.manager.onMoneyChanged = (money) => this.hud.updateMoney(money);
    this.manager.onMissChanged = (misses, max) => this.hud.updateMisses(misses, max);

    this.manager.onGameOver = (reason) => {
      this.input.stop();
      this.audio.stop();
      this.hud.hide();
      this.chat.hide();
      this.gameOverScreen.show(reason);
    };

    this.manager.onStateChanged = (state) => {
      if (state === GameState.RESULTS) {
        this.onRoundComplete();
      }
    };

    this.gameOverScreen.onRestart = () => this.restartFull();
    this.resultScreen.onRestart = () => this.restartFull();
  }

  private onRoundComplete(): void {
    this.hud.hide();
    this.chat.hide();
    const round = this.manager.roundIndex;

    if (round === ROUND_CONFIGS.length - 1) {
      // Последний раунд завершён — финал
      this.showEndingChoice();
      return;
    }

    // Показываем передышку между раундами
    const breakIdx = round + 1; // 1..3 = тексты между играми
    this.breakScreen.show(BREAK_SCREENS[breakIdx]);
    this.breakScreen.onContinue = () => {
      this.manager.nextRound();
      this.startRound();
    };
  }

  private showEndingChoice(): void {
    const endLines = [
      "Your debt is paid.",
      "",
      `"You are free to leave now."`,
      "",
      "L — Leave the table.",
      "S — Stay.",
    ];
    this.breakScreen.show({ lines: endLines, continueLabel: "L = Leave   S = Stay" });
    this.breakScreen.onContinue = null;

    const handleChoice = (e: KeyboardEvent) => {
      if (e.key === "l" || e.key === "L") {
        window.removeEventListener("keydown", handleChoice);
        this.breakScreen.hide();
        this.showFinalText([
          "You leave the table.",
          "The door closes behind you.",
          "",
          "Game over.",
        ]);
      } else if (e.key === "s" || e.key === "S") {
        window.removeEventListener("keydown", handleChoice);
        this.breakScreen.hide();
        this.showFinalText([
          "You pour a glass.",
          "Light a cigarette.",
          "Pull the knife from the table.",
          "",
          "The stream goes on.",
        ]);
      }
    };
    window.addEventListener("keydown", handleChoice);
  }

  private showFinalText(lines: string[]): void {
    this.breakScreen.show({ lines, continueLabel: "Press R to play again" });
    this.breakScreen.onContinue = null;
    const handleR = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        window.removeEventListener("keydown", handleR);
        this.breakScreen.hide();
        this.restartFull();
      }
    };
    window.addEventListener("keydown", handleR);
  }

  private registerUpdateLoop(): void {
    this.scene.onBeforeRenderObservable.add(() => {
      const deltaS = this.engine.getDeltaTime() / 1000;

      if (this.audio.isPlaying()) {
        const playbackMs = this.audio.getPlaybackMs();
        this.conductor.update(playbackMs);
        this.hud.updateProgress(this.conductor.getProgress());

        const next = this.conductor.getCurrentNote();
        if (next) this.table.highlightZone(next.zone);
      }

      this.camera.update(deltaS);
      this.table.update(deltaS);
      this.knife.update(deltaS);
    });
  }

  async start(): Promise<void> {
    const [beatmap] = await Promise.all([
      loadBeatmap("/assets/beatmaps/track_beatmap.json"),
      this.audio.loadTrack("/assets/audio/music/track.ogg"),
    ]);
    this.beatmap = beatmap;

    // Показываем вступление
    this.breakScreen.show(BREAK_SCREENS[0]);
    this.breakScreen.onContinue = () => {
      this.manager.reset();
      this.startRound();
    };
  }

  private startRound(): void {
    this.trackCompleted = false;
    this.resultScreen.hide();
    this.gameOverScreen.hide();

    const beatmap = this.beatmap!;
    this.conductor.load(beatmap);
    this.conductor.reset();
    this.manager.startGame(beatmap.length);

    this.hud.updateQuota(this.manager.config.quota);
    this.hud.updateMode("STAB  [1-5]");
    this.input.setMode("stab");
    this.hud.show();
    this.chat.start();

    this.audio.play();
    this.input.start();
  }

  private async restartFull(): Promise<void> {
    this.manager.reset();
    this.audio.stop();
    await this.audio.loadTrack("/assets/audio/music/track.ogg");
    this.startRound();
  }

  getScene(): Scene {
    return this.scene;
  }
}
