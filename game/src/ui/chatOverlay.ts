interface ChatMessage {
  user: string;
  text: string;
  color?: string;
}

const STUB_MESSAGES: ChatMessage[] = [
  { user: "anon_x99", text: "lmaooo he's gonna cut himself" },
  { user: "darkwave", text: "LETS GOOO" },
  { user: "viewer_042", text: "this is insane" },
  { user: "VIP_Richter", text: "don't choke now", color: "#fa0" },
  { user: "anon_x99", text: "miss miss miss miss" },
  { user: "bloody_good", text: "PogChamp" },
  { user: "viewer_042", text: "I can't watch" },
  { user: "VIP_Richter", text: "500 on him failing", color: "#fa0" },
  { user: "shadow_feed", text: "the way his hand is shaking lol" },
  { user: "anon_x99", text: "OMEGALUL" },
  { user: "nite_owl_7", text: "come on man you got this" },
  { user: "darkwave", text: "faster faster faster" },
  { user: "VIP_Kreuz", text: "I'm watching closely", color: "#a8f" },
  { user: "bloody_good", text: "the music is insane" },
  { user: "viewer_042", text: "how does he not miss more" },
  { user: "anon_x99", text: "one more miss and it's over" },
  { user: "nite_owl_7", text: "breathe man BREATHE" },
  { user: "VIP_Richter", text: "show them something", color: "#fa0" },
  { user: "darkwave", text: "!!!!!!!" },
  { user: "shadow_feed", text: "dude is built different" },
];

export class ChatOverlay {
  private container: HTMLDivElement;
  private messagesEl: HTMLDivElement;
  private interval: ReturnType<typeof setInterval> | null = null;
  private msgIndex = 0;

  constructor() {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "280px",
      maxHeight: "220px",
      overflow: "hidden",
      display: "none",
      flexDirection: "column",
      gap: "2px",
      pointerEvents: "none",
      userSelect: "none",
    });

    this.messagesEl = document.createElement("div");
    Object.assign(this.messagesEl.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    });

    this.container.appendChild(this.messagesEl);
    document.body.appendChild(this.container);
  }

  start(): void {
    this.container.style.display = "flex";
    this.msgIndex = Math.floor(Math.random() * STUB_MESSAGES.length);
    this.interval = setInterval(() => this.addNext(), 1800);
  }

  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.messagesEl.innerHTML = "";
  }

  hide(): void {
    this.container.style.display = "none";
    this.stop();
  }

  private addNext(): void {
    const msg = STUB_MESSAGES[this.msgIndex % STUB_MESSAGES.length];
    this.msgIndex++;
    this.addMessage(msg);
  }

  private addMessage(msg: ChatMessage): void {
    const el = document.createElement("div");
    Object.assign(el.style, {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#aaa",
      opacity: "0",
      transition: "opacity 0.3s",
    });

    const nameSpan = document.createElement("span");
    nameSpan.textContent = msg.user + ": ";
    nameSpan.style.color = msg.color ?? "#6cf";

    const textSpan = document.createElement("span");
    textSpan.textContent = msg.text;

    el.appendChild(nameSpan);
    el.appendChild(textSpan);
    this.messagesEl.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });

    // Держим не более 6 сообщений
    while (this.messagesEl.children.length > 6) {
      this.messagesEl.removeChild(this.messagesEl.firstChild!);
    }
  }

  dispose(): void {
    this.stop();
    this.container.remove();
  }
}
