# Knife Game — Project Structure

## Tech Stack

- **Runtime:** Browser (Canvas + WebGL)
- **Bundler:** Vite 7
- **Language:** TypeScript (strict mode)
- **3D Engine:** Babylon.js (`@babylonjs/core`, `@babylonjs/loaders`)
- **Audio:** Web Audio API

## Directory Layout

```
js_knife_game/
├── product/                               # Game design docs, notes, references
│   └── project_structure.md
├── game/                                  # Vite + TS + Babylon.js project
│   ├── index.html                         # Entry HTML — fullscreen <canvas>
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.ts                        # Engine bootstrap, render loop, resize
│   │   ├── game.ts                        # Orchestrator: wires events, manages round lifecycle
│   │   ├── scenes/
│   │   │   ├── gameScene.ts               # Root scene factory — composes all subsystems
│   │   │   ├── environment.ts             # Fog, glow, tonemap + warm/cold lights (horror lighting)
│   │   │   ├── gameCamera.ts              # First-person camera + shake effect
│   │   │   ├── table.ts                   # Table mesh + hand + fingers + zone markers (flash/highlight)
│   │   │   └── knife.ts                   # Knife mesh, movement between zones + stab animation
│   │   ├── rhythm/
│   │   │   ├── beatmapLoader.ts           # JSON beatmap parsing → BeatNote[]
│   │   │   ├── rhythmConductor.ts         # Core timing engine: note tracking, hit/miss detection
│   │   │   └── inputHandler.ts            # Keys 1-5 capture with debounce, zone_pressed callback
│   │   ├── managers/
│   │   │   ├── gameManager.ts             # Global state machine + score tracking
│   │   │   └── audioManager.ts            # Music playback, procedural SFX, getPlaybackMs()
│   │   └── ui/
│   │       ├── hud.ts                     # Score / Misses / Progress labels (DOM overlay)
│   │       └── resultScreen.ts            # Track complete overlay + restart (R)
│   ├── public/
│   │   └── assets/
│   │       ├── audio/
│   │       │   └── music/
│   │       │       └── track.ogg          # Music track
│   │       └── beatmaps/
│   │           └── track_beatmap.json     # Beatmap data (time_ms + zone pairs)
│   └── dist/                              # Build output (gitignored)
└── tools/
    └── generate_beatmap.py                # Python script: librosa onset detection → beatmap JSON
```

## Scene Composition (gameScene.ts)

```
Scene (Babylon.Scene)
  ├── Environment                          [environment.ts — lights + post-processing]
  ├── GameCamera (FreeCamera)              [gameCamera.ts — position + shake]
  ├── Table (TransformNode)                [table.ts — geometry + zone markers]
  ├── Knife (TransformNode)                [knife.ts — mesh + movement + stab]
  ├── RhythmConductor                      [rhythmConductor.ts — timing engine]
  ├── InputHandler                         [inputHandler.ts — key capture]
  ├── HUD                                  [hud.ts — DOM score/misses display]
  └── ResultScreen                         [resultScreen.ts — DOM end overlay]
```

## Architecture: Mediator Pattern

`game.ts` is the single orchestrator. No subsystem references any other subsystem directly. All communication flows through callbacks/events wired in `game.ts`.

### Event Flow: Hit

```
InputHandler.onZonePressed(zoneIndex)
  → game.ts calls rhythmConductor.tryHit(zoneIndex)
    → RhythmConductor.onNoteHit(noteIndex, zone, offsetMs)
      → game.ts calls:
          gameManager.addScore()
          knife.stab()
          table.flashZone(zone, GREEN)
          audioManager.playHit()
```

### Event Flow: Miss (timeout)

```
RhythmConductor.update() detects note past timing window
  → RhythmConductor.onNoteMissed(noteIndex, zone)
    → game.ts calls:
        gameManager.addMiss()
        table.flashZone(zone, RED)
        gameCamera.shake()
        audioManager.playMiss()
```

### Event Flow: Track Complete

```
RhythmConductor.onTrackCompleted()
  → game.ts calls:
      inputHandler.stop()
      gameManager.endGame()
      resultScreen.showResults(score, misses, total)
```

## Module Responsibilities

| Module | Type | Responsibility |
|--------|------|----------------|
| `gameManager.ts` | Singleton | GameState enum (MENU, PLAYING, RESULTS), score/misses tracking, restart, callbacks: `onScoreChanged`, `onMissChanged`, `onStateChanged` |
| `audioManager.ts` | Singleton | Music load/play/stop via Web Audio API, procedural SFX tone generation (hit 520Hz, miss 180Hz), `getPlaybackMs()` for sync |
| `beatmapLoader.ts` | Pure function | `loadBeatmap(url): Promise<BeatNote[]>` — fetches and parses JSON beatmap |
| `rhythmConductor.ts` | Class | Holds beatmap + currentNote, `update(deltaMs)` skips missed notes, `tryHit(zone)` validates timing, callbacks: `onNoteHit`, `onNoteMissed`, `onTrackCompleted` |
| `inputHandler.ts` | Class | Listens keydown for keys 1-5 with debounce, fires `onZonePressed(index)` |
| `knife.ts` | Class | `updatePosition()` lerps between zone X positions, `stab()` triggers vertical animation via Babylon Animation |
| `table.ts` | Class | Builds table/hand/fingers/zone marker meshes, `flashZone(index, color)`, `highlightZone(index)` |
| `gameCamera.ts` | Class | First-person position/FOV setup, `shake(intensity, duration)` with decay |
| `environment.ts` | Function | Configures scene clearColor, fog, glow layer, tone mapping + warm main PointLight + cold accent PointLight |
| `hud.ts` | Class | Creates DOM overlay, listens to gameManager callbacks, updates score/misses/progress |
| `resultScreen.ts` | Class | Creates DOM overlay, `showResults()` displays end screen, handles R key for restart |
| `game.ts` | Class | Loads track/beatmap, creates all subsystems, wires all callbacks, manages round lifecycle |

## Key Parameters

| Parameter | Value | Location |
|-----------|-------|----------|
| Timing window | ±200ms | `rhythmConductor.ts` |
| Zone count | 5 | `inputHandler.ts`, `table.ts` |
| Zone keys | 1, 2, 3, 4, 5 | `inputHandler.ts` |
| Zone X positions | -0.32, -0.16, 0.0, 0.16, 0.32 | `table.ts`, `knife.ts` |
| Stab duration | 0.1s | `knife.ts` |
| Camera shake | 0.03 intensity, 0.2s | `gameCamera.ts` |
| Hit SFX | 520Hz, 80ms | `audioManager.ts` |
| Miss SFX | 180Hz, 150ms | `audioManager.ts` |

## Beatmap Format

```json
[
  { "time_ms": 708, "zone": 0 },
  { "time_ms": 1440, "zone": 1 },
  ...
]
```

Generated by `tools/generate_beatmap.py` using librosa onset detection. Configurable sensitivity, min gap, and zone count.
