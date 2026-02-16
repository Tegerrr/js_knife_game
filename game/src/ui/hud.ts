export class HUD {
  private container: HTMLDivElement;
  private scoreEl: HTMLSpanElement;
  private missesEl: HTMLSpanElement;
  private progressEl: HTMLSpanElement;

  constructor() {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "absolute",
      top: "20px",
      left: "20px",
      color: "#ccc",
      fontFamily: "monospace",
      fontSize: "18px",
      userSelect: "none",
      pointerEvents: "none",
      lineHeight: "1.6",
    });

    this.scoreEl = document.createElement("span");
    this.missesEl = document.createElement("span");
    this.progressEl = document.createElement("span");

    this.container.innerHTML = "";
    const scoreLine = document.createElement("div");
    scoreLine.textContent = "SCORE: ";
    scoreLine.appendChild(this.scoreEl);
    this.scoreEl.textContent = "0";

    const missLine = document.createElement("div");
    missLine.textContent = "MISSES: ";
    missLine.appendChild(this.missesEl);
    this.missesEl.textContent = "0";
    this.missesEl.style.color = "#e44";

    const progressLine = document.createElement("div");
    progressLine.textContent = "PROGRESS: ";
    progressLine.appendChild(this.progressEl);
    this.progressEl.textContent = "0%";

    this.container.appendChild(scoreLine);
    this.container.appendChild(missLine);
    this.container.appendChild(progressLine);

    document.body.appendChild(this.container);
  }

  updateScore(score: number): void {
    this.scoreEl.textContent = String(score);
  }

  updateMisses(misses: number): void {
    this.missesEl.textContent = String(misses);
  }

  updateProgress(ratio: number): void {
    this.progressEl.textContent = `${Math.round(ratio * 100)}%`;
  }

  show(): void {
    this.container.style.display = "block";
  }

  hide(): void {
    this.container.style.display = "none";
  }

  dispose(): void {
    this.container.remove();
  }
}
