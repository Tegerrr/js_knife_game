import type { GameOverReason } from "../managers/gameManager";

export class GameOverScreen {
  private overlay: HTMLDivElement;
  private contentEl: HTMLDivElement;
  onRestart: (() => void) | null = null;
  private readonly handleKey: (e: KeyboardEvent) => void;

  constructor() {
    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, {
      position: "absolute",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0, 0, 0, 0.92)",
      zIndex: "10",
    });

    this.contentEl = document.createElement("div");
    Object.assign(this.contentEl.style, {
      color: "#e44",
      fontFamily: "monospace",
      fontSize: "28px",
      textAlign: "center",
      lineHeight: "1.8",
    });

    this.overlay.appendChild(this.contentEl);
    document.body.appendChild(this.overlay);

    this.handleKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        this.hide();
        this.onRestart?.();
      }
    };
  }

  show(reason: GameOverReason): void {
    const message = reason === "misses"
      ? "YOU BLED OUT"
      : "DEBT NOT PAID";

    this.contentEl.innerHTML = [
      "GAME OVER",
      "",
      `<span style="color:#ccc;font-size:20px">${message}</span>`,
      "",
      '<span style="color:#888;font-size:16px">Press R to restart</span>',
    ].join("<br>");

    this.overlay.style.display = "flex";
    window.addEventListener("keydown", this.handleKey);
  }

  hide(): void {
    this.overlay.style.display = "none";
    window.removeEventListener("keydown", this.handleKey);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKey);
    this.overlay.remove();
  }
}
