export interface BreakConfig {
  lines: string[];
  continueLabel?: string;
}

export class BreakScreen {
  private overlay: HTMLDivElement;
  private contentEl: HTMLDivElement;
  onContinue: (() => void) | null = null;
  private readonly handleKey: (e: KeyboardEvent) => void;

  constructor() {
    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, {
      position: "absolute",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0, 0, 0, 0.9)",
      zIndex: "10",
    });

    this.contentEl = document.createElement("div");
    Object.assign(this.contentEl.style, {
      color: "#ccc",
      fontFamily: "monospace",
      fontSize: "20px",
      textAlign: "center",
      lineHeight: "2",
      maxWidth: "600px",
    });

    this.overlay.appendChild(this.contentEl);
    document.body.appendChild(this.overlay);

    this.handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        this.hide();
        this.onContinue?.();
      }
    };
  }

  show(config: BreakConfig): void {
    const label = config.continueLabel ?? "Press SPACE to continue";
    const html = config.lines
      .map(l => l === "" ? "<br>" : `<div>${l}</div>`)
      .join("");
    this.contentEl.innerHTML =
      html + `<br><span style="color:#555;font-size:15px">${label}</span>`;
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
