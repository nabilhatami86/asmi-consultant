"use client";
import { Fragment, useEffect, useState } from "react";
import {
  ScoutData,
  ScoutAiOut,
  ScoutGap,
  ScoutWhiteSpace,
  ScoutBlindSpot,
  ScoutRec,
  getScoutData,
  postScoutAi,
  num,
  rp,
} from "@/lib/api";
import Markdown from "@/components/Markdown";

const FOCUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "gap", label: "Gap Analysis" },
  { key: "whitespace", label: "Celah Aroma" },
  { key: "blindspot", label: "Blind Spot" },
  { key: "rekomendasi", label: "Rekomendasi" },
];

export default function Scouting() {
  const [focus, setFocus] = useState("all");
  const [data, setData] = useState<ScoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  // AI report state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"groq" | "demo" | null>(null);
  const [userContext, setUserContext] = useState("");

  // Expand state for blind spot
  const [openBrand, setOpenBrand] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErr(false);
    getScoutData({ focus, limit: 15 })
      .then(setData)
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, [focus]);

  async function generateReport() {
    setAiLoading(true);
    setAiReport(null);
    try {
      const out: ScoutAiOut = await postScoutAi({ focus, context: userContext });
      setAiReport(out.report);
      setAiMode(out.mode);
    } catch {
      setAiReport("Gagal menghubungi server. Pastikan backend jalan di port 8000.");
      setAiMode(null);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Scouting</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Analisis mendalam untuk menemukan peluang produk baru. Data dari riset 230 varian, 11 brand lokal,
            148 original. Angka terjual = snapshot kumulatif Shopee; label dupe = dugaan.
          </p>
        </div>
      </div>

      {/* Tab Focus */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FOCUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setFocus(t.key); setAiReport(null); }}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              focus === t.key ? "bg-ink text-white" : "bg-sand-100 text-stone-600 hover:bg-sand-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && <p className="mt-8 text-center text-stone-500">Memuat data scouting...</p>}
      {err && <p className="mt-8 text-center text-red-600">Gagal memuat. Pastikan backend jalan.</p>}

      {!loading && !err && data && (
        <div className="mt-6 space-y-8">
          {/* ========== GAP ANALYSIS ========== */}
          {data.gap_analysis && (
            <section>
              <h2 className="font-display text-xl">Gap Analysis</h2>
              <p className="mt-1 text-sm text-stone-500">{data.gap_analysis.deskripsi}</p>
              <p className="mt-1 text-xs text-stone-400">Total kuadran peluang: {data.gap_analysis.total}</p>
              <div className="mt-3 overflow-x-auto rounded-xl border border-sand-200 bg-white">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-sand-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-3 py-2">Original</th>
                      <th className="px-3 py-2 text-right">Pesaing</th>
                      <th className="px-3 py-2 text-right">Terjual</th>
                      <th className="px-3 py-2 text-right">Skor</th>
                      <th className="px-3 py-2">Contoh Dupe Lokal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gap_analysis.top.map((g: ScoutGap) => (
                      <tr key={g.line_full} className="border-t border-sand-100 hover:bg-sand-50">
                        <td className="px-3 py-2.5 font-medium">{g.line_full}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{g.n_brand_dupe}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{num(g.sold_w)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{g.opportunity_score ?? "-"}</td>
                        <td className="px-3 py-2.5 text-xs text-stone-500">
                          {g.contoh_dupe_lokal?.map((d, i) => (
                            <span key={i}>
                              {d.brand} {d.variant} ({rp(d.price_median)})
                              {i < (g.contoh_dupe_lokal?.length ?? 0) - 1 && ", "}
                            </span>
                          )) ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ========== WHITE SPACE ========== */}
          {data.white_space && data.white_space.hasil.length > 0 && (
            <section>
              <h2 className="font-display text-xl">Celah Aroma (White Space)</h2>
              <p className="mt-1 text-sm text-stone-500">{data.white_space.deskripsi}</p>
              <div className="mt-3 overflow-x-auto rounded-xl border border-sand-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-sand-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-3 py-2">Note / Aroma</th>
                      <th className="px-3 py-2 text-right">Di Bestseller</th>
                      <th className="px-3 py-2 text-right">Total Varian</th>
                      <th className="px-3 py-2 text-right">Rasio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.white_space.hasil.map((w: ScoutWhiteSpace, i: number) => (
                      <tr key={w.note || w.core || i} className="border-t border-sand-100 hover:bg-sand-50">
                        <td className="px-3 py-2.5 font-medium">{w.note || w.core}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{w.di_bestseller ?? w.n_Lokal}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{w.total_varian ?? w.n_Timteng}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            (w.rasio_bestseller ?? 0) >= 0.5 ? "bg-emerald-100 text-emerald-800" : "bg-sand-100 text-stone-600"
                          }`}>
                            {w.rasio_bestseller ?? w.selisih ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ========== BLIND SPOT ========== */}
          {data.blind_spot && data.blind_spot.hasil.length > 0 && (
            <section>
              <h2 className="font-display text-xl">Blind Spot Pesaing</h2>
              <p className="mt-1 text-sm text-stone-500">{data.blind_spot.deskripsi}</p>
              <div className="mt-3 overflow-x-auto rounded-xl border border-sand-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-sand-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-3 py-2">Brand</th>
                      <th className="px-3 py-2 text-right">Original Belum Cover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.blind_spot.hasil.map((b: ScoutBlindSpot) => (
                      <Fragment key={b.brand}>
                        <tr
                          onClick={() => setOpenBrand(openBrand === b.brand ? null : b.brand)}
                          className="cursor-pointer border-t border-sand-100 hover:bg-sand-50"
                        >
                          <td className="px-3 py-2.5 font-medium">{b.brand}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                              {b.total_missing} original
                            </span>
                          </td>
                        </tr>
                        {openBrand === b.brand && (
                          <tr className="bg-sand-50">
                            <td colSpan={2} className="px-4 py-3">
                              <p className="mb-2 text-xs text-stone-500">Original laris yang belum di-cover {b.brand}:</p>
                              <ul className="grid gap-1 sm:grid-cols-2">
                                {b.belum_cover.map((o) => (
                                  <li key={o.line_full} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-1.5">
                                    <span>{o.line_full}</span>
                                    <span className="shrink-0 text-stone-500 tabular-nums">
                                      {num(o.sold_w)} terjual, {o.n_brand_dupe} pesaing
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ========== REKOMENDASI ========== */}
          {data.rekomendasi && data.rekomendasi.hasil.length > 0 && (
            <section>
              <h2 className="font-display text-xl">Rekomendasi Produk Baru</h2>
              <p className="mt-1 text-sm text-stone-500">{data.rekomendasi.deskripsi}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.rekomendasi.hasil.map((r: ScoutRec) => (
                  <div key={r.original_target} className="rounded-xl border border-sand-200 bg-white p-4">
                    <h3 className="font-medium">{r.original_target}</h3>
                    <div className="mt-2 space-y-1 text-sm text-stone-600">
                      <p>Skor: <span className="font-medium text-gold-600">{r.opportunity_score ?? "-"}</span></p>
                      <p>Pesaing lokal: {r.pesaing_lokal}</p>
                      <p>Terjual (dupe): {num(r.total_terjual_dupe)}</p>
                      <p>Harga dupe: {r.kisaran_harga_dupe}</p>
                      {r.notes_umum && <p className="text-xs text-stone-400">Aroma: {r.notes_umum}</p>}
                    </div>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] ${
                      r.kuadran.includes("peluang") ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                    }`}>
                      {r.kuadran.split(" (")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========== AI SCOUT REPORT ========== */}
          <section className="rounded-xl border-2 border-gold-500 bg-white p-5">
            <h2 className="font-display text-xl">AI Scout Report</h2>
            <p className="mt-1 text-sm text-stone-500">
              Kirim data scouting ke AI untuk mendapat analisis naratif dan rekomendasi aksi.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Konteks tambahan (opsional): mis. 'fokus parfum wanita budget 200rb'"
                maxLength={500}
                className="flex-1 rounded-xl border border-sand-300 bg-sand-50 px-4 py-2 text-sm outline-none focus:border-gold-500"
              />
              <button
                onClick={generateReport}
                disabled={aiLoading}
                className="rounded-xl bg-gold-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-gold-700 disabled:opacity-40"
              >
                {aiLoading ? "Generating..." : "Generate Report"}
              </button>
            </div>
            {aiLoading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gold-500" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </span>
                AI sedang menganalisis data...
              </div>
            )}
            {aiReport && !aiLoading && (
              <div className="mt-4">
                {aiMode && (
                  <p className="mb-2 text-[11px] text-stone-400">
                    {aiMode === "groq" ? "Mode AI (Groq)" : "Mode demo"} 
                  </p>
                )}
                <div className="rounded-xl border border-sand-200 bg-sand-50 p-4">
                  <Markdown>{aiReport}</Markdown>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <p className="mt-6 text-center text-[11px] text-stone-500">
        Terjual = kumulatif snapshot Shopee; pasangan dupe adalah dugaan; sampel kecil.
      </p>
    </main>
  );
}
