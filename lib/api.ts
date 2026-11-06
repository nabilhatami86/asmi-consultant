export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Role = "user" | "assistant";
export interface ChatMsg { role: Role; content: string }
export interface ToolUse { name: string; input: Record<string, unknown> }
export interface ChatOut { answer: string; mode: "groq" | "demo"; tools: ToolUse[]; notice?: string }

export interface OriginalRow {
  line_full: string;
  original_brand: string;
  n_brand_dupe: number;
  sold_w: number | null;
  ppm_edp: number | null;
  kuadran: string;
  opportunity_score: number | null;
  notes_umum: string | null;
}

export interface Product {
  id_parfume?: string;
  variant_id?: string;
  brand: string;
  variant: string;
  sizes?: string;
  price_median?: number | null;
  price_mid?: number | null;
  sold_total?: number | null;
  sold_est?: number | null;
  gender?: string;
  concentrate?: string;
  top_notes?: string | null;
  mid_notes?: string | null;
  base_notes?: string | null;
  skor_kemiripan?: number;
}

export interface DupeResult {
  ditemukan: boolean;
  pesan?: string;
  original_cocok?: string;
  statistik_original?: any;
  produk_lokal_berlabel_dupe?: Product[];
  produk_lokal_notes_mirip?: Product[];
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Server ${res.status}`);
  return res.json() as Promise<T>;
}

export const getHealth = () => fetch(`${API}/api/health`).then(j<{ ok: boolean; mode: "groq" | "demo"; model: string | null }>);

export const postChat = (messages: ChatMsg[]) =>
  fetch(`${API}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  }).then(j<ChatOut>);

export const postChatPdf = (file: File, prompt: string) => {
  const form = new FormData();
  form.append("file", file);
  form.append("prompt", prompt);
  return fetch(`${API}/api/chat/pdf`, {
    method: "POST",
    body: form,
  }).then(j<{ answer: string; mode: string; extracted_text_len: number }>);
};

export const getOriginals = (p: { q?: string; kuadran?: string; sort_by?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
  return fetch(`${API}/api/originals?${qs}`).then(j<{ total_cocok: number; hasil: OriginalRow[] }>);
};

export const getDupes = (original: string) =>
  fetch(`${API}/api/dupes?original=${encodeURIComponent(original)}&top_n=5`).then(j<DupeResult>);

// --- Scouting types ---
export interface ScoutGap {
  line_full: string;
  n_brand_dupe: number;
  sold_w: number | null;
  opportunity_score: number | null;
  notes_umum: string | null;
  contoh_dupe_lokal?: { id_parfume?: string; brand: string; variant: string; price_median: number | null; sold_total: number | null; concentrate: string }[];
}

export interface ScoutWhiteSpace {
  note?: string;
  core?: string;
  di_bestseller?: number;
  total_varian?: number;
  rasio_bestseller?: number;
  n_Lokal?: number;
  n_Timteng?: number;
  selisih?: number;
  layer?: string;
}

export interface ScoutBlindSpot {
  brand: string;
  total_missing: number;
  belum_cover: { line_full?: string; original?: string; sold_w: number | null; n_brand_dupe: number; opportunity_score: number | null }[];
}

export interface ScoutRec {
  original_target: string;
  opportunity_score: number | null;
  pesaing_lokal: number;
  total_terjual_dupe: number | null;
  notes_umum: string | null;
  notes_profil_dupe?: string;
  kisaran_harga_dupe?: string;
  kuadran: string;
}

export interface ScoutData {
  gap_analysis?: { deskripsi: string; total: number; top: ScoutGap[] };
  white_space?: { deskripsi: string; hasil: ScoutWhiteSpace[] };
  blind_spot?: { deskripsi: string; hasil: ScoutBlindSpot[] };
  rekomendasi?: { deskripsi: string; hasil: ScoutRec[] };
  context_pasar?: any;
}

export interface ScoutAiOut {
  report: string;
  mode: "groq" | "demo";
  tools: any[];
  data: ScoutData;
}

export const getScoutData = (p: { focus?: string; gender?: string; budget_max?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
  return fetch(`${API}/api/scout?${qs}`).then(j<ScoutData>);
};

export const postScoutAi = (p: { focus?: string; gender?: string; budget_max?: number; context?: string }) =>
  fetch(`${API}/api/scout/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  }).then(j<ScoutAiOut>);

export const rp = (v: number | null | undefined) => (v == null ? "-" : "Rp " + Math.round(v).toLocaleString("id-ID"));
export const num = (v: number | null | undefined) => (v == null ? "-" : Math.round(v).toLocaleString("id-ID"));
