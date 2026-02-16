import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class GameCamera {
  readonly camera: FreeCamera;
  private basePosition: Vector3;
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeElapsed = 0;

  constructor(scene: Scene) {
    this.camera = new FreeCamera("gameCamera", new Vector3(0, 2.5, -2.2), scene);
    this.camera.setTarget(new Vector3(0, 0.8, 0));
    this.camera.fov = 0.9;
    this.basePosition = this.camera.position.clone();

    // No user control — fixed camera
    this.camera.inputs.clear();
  }

  shake(intensity = 0.03, duration = 0.2): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeElapsed = 0;
  }

  update(deltaS: number): void {
    if (this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += deltaS;
      const decay = 1 - this.shakeElapsed / this.shakeDuration;
      const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * decay;
      const offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * decay;
      this.camera.position.x = this.basePosition.x + offsetX;
      this.camera.position.y = this.basePosition.y + offsetY;
    } else {
      this.camera.position.x = this.basePosition.x;
      this.camera.position.y = this.basePosition.y;
    }
  }
}
