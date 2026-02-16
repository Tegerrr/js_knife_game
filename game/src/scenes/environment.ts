import { Scene } from "@babylonjs/core/scene";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

export function setupEnvironment(scene: Scene): void {
  // Dark background
  scene.clearColor = new Color4(0.02, 0.02, 0.04, 1);

  // Fog for depth
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.06;
  scene.fogColor = new Color3(0.02, 0.02, 0.04);

  // Warm main light (overhead, slightly forward)
  const warmLight = new PointLight("warmLight", new Vector3(0, 3, -1), scene);
  warmLight.diffuse = new Color3(1.0, 0.85, 0.6);
  warmLight.intensity = 1.2;
  warmLight.range = 12;

  // Cold accent light (side)
  const coldLight = new PointLight("coldLight", new Vector3(2, 2, 1), scene);
  coldLight.diffuse = new Color3(0.4, 0.5, 0.8);
  coldLight.intensity = 0.4;
  coldLight.range = 8;

  // Glow layer for emissive effects
  const glow = new GlowLayer("glow", scene);
  glow.intensity = 0.3;
}
