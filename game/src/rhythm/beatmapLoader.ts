export type NoteType = "stab" | "trick";

export interface BeatNote {
  time_ms: number;
  zone: number;
  type: NoteType;
}

export async function loadBeatmap(url: string): Promise<BeatNote[]> {
  const response = await fetch(url);
  const data: { time_ms: number; zone: number; type?: NoteType }[] = await response.json();
  // Backwards compat: если type не задан — считаем stab
  return data.map(n => ({ ...n, type: n.type ?? "stab" }));
}
