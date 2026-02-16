import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Table } from "./table";

const STAB_DURATION = 0.1;
const STAB_DEPTH = 0.12;
const LERP_SPEED = 12;

export class Knife {
  readonly root: TransformNode;
  private targetX = 0;
  private stabTimer = 0;
  private baseY: number;

  constructor(scene: Scene) {
    this.root = new TransformNode("knife", scene);

    // Blade
    const blade = MeshBuilder.CreateBox("blade", { width: 0.02, height: 0.5, depth: 0.08 }, scene);
    blade.position.y = 0.15;
    blade.parent = this.root;
    const bladeMat = new StandardMaterial("bladeMat", scene);
    bladeMat.diffuseColor = new Color3(0.75, 0.78, 0.8);
    bladeMat.specularColor = new Color3(1, 1, 1);
    bladeMat.specularPower = 64;
    blade.material = bladeMat;

    // Handle
    const handle = MeshBuilder.CreateBox("handle", { width: 0.025, height: 0.2, depth: 0.06 }, scene);
    handle.position.y = 0.5;
    handle.parent = this.root;
    const handleMat = new StandardMaterial("handleMat", scene);
    handleMat.diffuseColor = new Color3(0.3, 0.15, 0.05);
    handle.material = handleMat;

    // Initial position — above the table, centered
    this.root.position.set(0, 0.35, -0.1);
    this.baseY = this.root.position.y;
  }

  moveToZone(zoneIndex: number): void {
    const positions = Table.ZONE_POSITIONS;
    if (zoneIndex >= 0 && zoneIndex < positions.length) {
      this.targetX = positions[zoneIndex];
    }
  }

  stab(): void {
    this.stabTimer = STAB_DURATION;
  }

  update(deltaS: number): void {
    // Lerp X position toward target zone
    const dx = this.targetX - this.root.position.x;
    this.root.position.x += dx * LERP_SPEED * deltaS;

    // Stab animation (vertical)
    if (this.stabTimer > 0) {
      this.stabTimer -= deltaS;
      const t = 1 - this.stabTimer / STAB_DURATION;
      // Down then up: parabolic
      const stabOffset = -STAB_DEPTH * 4 * t * (1 - t);
      this.root.position.y = this.baseY + stabOffset;
    } else {
      this.root.position.y = this.baseY;
    }
  }
}
