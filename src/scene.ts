import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export function createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
  const scene = new Scene(engine);
  scene.clearColor.set(0.1, 0.1, 0.15, 1);

  // Camera
  const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 20;

  // Light
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  // Ground placeholder
  const ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.2, 0.2, 0.25);
  ground.material = groundMat;

  // Knife placeholder (simple box for now)
  const knife = MeshBuilder.CreateBox("knife", { width: 0.1, height: 1.5, depth: 0.02 }, scene);
  knife.position.y = 1;
  const knifeMat = new StandardMaterial("knifeMat", scene);
  knifeMat.diffuseColor = new Color3(0.8, 0.8, 0.85);
  knife.material = knifeMat;

  // Target placeholder (cylinder)
  const target = MeshBuilder.CreateCylinder("target", { diameter: 2, height: 0.3 }, scene);
  target.position.y = 2.5;
  const targetMat = new StandardMaterial("targetMat", scene);
  targetMat.diffuseColor = new Color3(0.6, 0.3, 0.1);
  target.material = targetMat;

  return scene;
}
