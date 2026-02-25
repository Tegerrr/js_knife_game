export class HUD {
  private container: HTMLDivElement;
  private moneyEl: HTMLSpanElement;
  private quotaEl: HTMLSpanElement;
  private missesEl: HTMLSpanElement;
  private progressEl: HTMLSpanElement;
  private modeEl: HTMLSpanElement;

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

    this.moneyEl = document.createElement("span");
    this.quotaEl = document.createElement("span");
    this.missesEl = document.createElement("span");
    this.progressEl = document.createElement("span");
    this.modeEl = document.createElement("span");

    const moneyLine = document.createElement("div");
    moneyLine.textContent = "MONEY: $";
    moneyLine.appendChild(this.moneyEl);
    this.moneyEl.textContent = "0";

    const quotaLine = document.createElement("div");
    quotaLine.textContent = "QUOTA: $";
    quotaLine.appendChild(this.quotaEl);
    this.quotaEl.textContent = "0";
    this.quotaEl.style.color = "#fa0";

    const missLine = document.createElement("div");
    missLine.textContent = "MISSES: ";
    missLine.appendChild(this.missesEl);
    this.missesEl.textContent = "0 / 10";
    this.missesEl.style.color = "#e44";

    const progressLine = document.createElement("div");
    progressLine.textContent = "PROGRESS: ";
    progressLine.appendChild(this.progressEl);
    this.progressEl.textContent = "0%";

    const modeLine = document.createElement("div");
    modeLine.textContent = "MODE: ";
    modeLine.appendChild(this.modeEl);
    this.modeEl.textContent = "—";
    this.modeEl.style.color = "#8cf";

    this.container.appendChild(moneyLine);
    this.container.appendChild(quotaLine);
    this.container.appendChild(missLine);
    this.container.appendChild(progressLine);
    this.container.appendChild(modeLine);

    document.body.appendChild(this.container);
  }

  updateMoney(money: number): void {
    this.moneyEl.textContent = String(money);
  }

  updateQuota(quota: number): void {
    this.quotaEl.textContent = String(quota);
  }

  updateMisses(misses: number, max: number): void {
    this.missesEl.textContent = `${misses} / ${max}`;
  }

  updateProgress(ratio: number): void {
    this.progressEl.textContent = `${Math.round(ratio * 100)}%`;
  }

  updateMode(mode: string): void {
    this.modeEl.textContent = mode;
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
