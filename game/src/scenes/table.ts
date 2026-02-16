import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";

const ZONE_COUNT = 5;
const ZONE_POSITIONS = [-0.32, -0.16, 0.0, 0.16, 0.32];
const FINGER_GAP = 0.16;

export class Table {
  readonly root: TransformNode;
  private zoneMarkers: Mesh[] = [];
  private zoneBaseMaterials: StandardMaterial[] = [];
  private flashTimers: number[] = [];

  constructor(scene: Scene) {
    this.root = new TransformNode("table", scene);

    // Table surface
    const tableMesh = MeshBuilder.CreateBox("tableSurface", { width: 1.6, height: 0.08, depth: 1.2 }, scene);
    tableMesh.position.y = 0;
    tableMesh.parent = this.root;
    const tableMat = new StandardMaterial("tableMat", scene);
    tableMat.diffuseColor = new Color3(0.25, 0.15, 0.08);
    tableMat.specularColor = new Color3(0.1, 0.06, 0.03);
    tableMesh.material = tableMat;

    // Hand (palm)
    const palm = MeshBuilder.CreateBox("palm", { width: 0.6, height: 0.06, depth: 0.35 }, scene);
    palm.position.set(0, 0.07, 0.2);
    palm.parent = this.root;
    const skinMat = new StandardMaterial("skinMat", scene);
    skinMat.diffuseColor = new Color3(0.85, 0.65, 0.5);
    palm.material = skinMat;

    // Fingers — 5 fingers spread out
    for (let i = 0; i < ZONE_COUNT; i++) {
      const finger = MeshBuilder.CreateBox(`finger${i}`, { width: 0.05, height: 0.05, depth: 0.3 }, scene);
      finger.position.set(ZONE_POSITIONS[i], 0.07, -0.1);
      finger.parent = this.root;
      finger.material = skinMat;
    }

    // Zone markers (gaps between/outside fingers where knife stabs)
    for (let i = 0; i < ZONE_COUNT; i++) {
      const marker = MeshBuilder.CreatePlane(`zone${i}`, { width: FINGER_GAP * 0.6, height: 0.25 }, scene);
      marker.position.set(ZONE_POSITIONS[i], 0.045, -0.1);
      marker.rotation.x = Math.PI / 2;
      marker.parent = this.root;

      const markerMat = new StandardMaterial(`zoneMat${i}`, scene);
      markerMat.diffuseColor = new Color3(0.15, 0.15, 0.15);
      markerMat.alpha = 0.3;
      markerMat.emissiveColor = new Color3(0, 0, 0);
      marker.material = markerMat;

      this.zoneMarkers.push(marker);
      this.zoneBaseMaterials.push(markerMat);
      this.flashTimers.push(0);
    }
  }

  flashZone(zoneIndex: number, color: Color3): void {
    if (zoneIndex < 0 || zoneIndex >= ZONE_COUNT) return;
    const mat = this.zoneBaseMaterials[zoneIndex];
    mat.emissiveColor = color;
    mat.alpha = 0.8;
    this.flashTimers[zoneIndex] = 0.15;
  }

  highlightZone(zoneIndex: number): void {
    if (zoneIndex < 0 || zoneIndex >= ZONE_COUNT) return;
    // Dim all, highlight one
    for (let i = 0; i < ZONE_COUNT; i++) {
      this.zoneBaseMaterials[i].alpha = i === zoneIndex ? 0.6 : 0.2;
    }
  }

  update(deltaS: number): void {
    for (let i = 0; i < ZONE_COUNT; i++) {
      if (this.flashTimers[i] > 0) {
        this.flashTimers[i] -= deltaS;
        if (this.flashTimers[i] <= 0) {
          this.zoneBaseMaterials[i].emissiveColor = new Color3(0, 0, 0);
          this.zoneBaseMaterials[i].alpha = 0.3;
        }
      }
    }
  }

  static get ZONE_POSITIONS(): number[] {
    return ZONE_POSITIONS;
  }
}
