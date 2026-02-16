export class ResultScreen {
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
      background: "rgba(0, 0, 0, 0.85)",
      zIndex: "10",
    });

    this.contentEl = document.createElement("div");
    Object.assign(this.contentEl.style, {
      color: "#ccc",
      fontFamily: "monospace",
      fontSize: "24px",
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

  showResults(score: number, misses: number, total: number): void {
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    this.contentEl.innerHTML = [
      "TRACK COMPLETE",
      "",
      `SCORE: ${score} / ${total}`,
      `MISSES: ${misses}`,
      `ACCURACY: ${accuracy}%`,
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
