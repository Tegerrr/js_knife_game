export interface BeatNote {
  time_ms: number;
  zone: number;
}

export async function loadBeatmap(url: string): Promise<BeatNote[]> {
  const response = await fetch(url);
  const data: BeatNote[] = await response.json();
  return data;
}
