"use client";
import { Fragment, useEffect, useState } from "react";
import { Pagination } from "@/components/Pagination";
import {
  DupeResult,
  OriginalRow,
  getDupes,
  getOriginals,
  num,
  rp,
} from "@/lib/api";

const TABS = [
  { key: "", label: "Semua" },
  { key: "peluang", label: "Peluang" },
  { key: "terbukti", label: "Terbukti" },
  { key: "hati_hati", label: "Hati-hati" },
  { key: "sepi", label: "Sepi" },
];

const BADGE: Record<string, string> = {
  "SEPI tapi CEPAT (peluang)": "bg-emerald-100 text-emerald-800",
  "RAMAI & CEPAT": "bg-amber-100 text-amber-800",
  "RAMAI tapi biasa": "bg-red-100 text-red-800",
  "sepi & biasa": "bg-stone-200 text-stone-700",
};

export default function Peluang() {
  const [kuadran, setKuadran] = useState("peluang");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [rows, setRows] = useState<OriginalRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<DupeResult | null>(null);

  useEffect(() => {
    setLoading(true);
    setErr(false);
    const t = setTimeout(() => {
      getOriginals({
        kuadran,
        q,
        limit: 100,
        sort_by: kuadran === "" ? "terjual" : "opportunity",
      })
        .then((r) => {
          setRows(r.hasil);
          setTotal(r.total_cocok);
        })
        .catch(() => setErr(true))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [kuadran, q]);

  // Pagination client-side dari total rows
  const totalPages = Math.ceil(rows.length / pageSize) || 1;
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  async function toggle(name: string) {
    if (open === name) return setOpen(null);
    setOpen(name);
    setDetail(null);
    setDetail(
      await getDupes(name).catch(() => ({
        ditemukan: false,
        pesan: "Gagal memuat detail.",
      })),
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl">Peta Peluang</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Parfum original yang jadi acuan dupe, dikelompokkan dari jumlah pesaing
        lokal dan penjualan dupe-nya. Angka terjual adalah kumulatif satu
        snapshot Shopee dan pasangan dupe masih dugaan.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setKuadran(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${kuadran === t.key ? "bg-ink text-white" : "bg-sand-100 text-stone-600 hover:bg-sand-200"}`}
          >
            {t.label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari original, mis. dior"
          className="ml-auto w-full rounded-full border border-sand-300 bg-white px-4 py-1.5 text-sm outline-none focus:border-gold-500 sm:w-60"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-sand-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-xs sm:text-sm">
          <thead className="bg-sand-100 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2">Original</th>
              <th className="px-3 py-2 text-right">Brand pesaing</th>
              <th className="px-3 py-2 text-right">Terjual (dupe)</th>
              <th className="px-3 py-2 text-right">Rp/ml EDP</th>
              <th className="px-3 py-2 text-right">Skor</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-stone-500"
                >
                  Memuat...
                </td>
              </tr>
            )}
            {err && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-red-600">
                  Gagal memuat. Pastikan backend jalan.
                </td>
              </tr>
            )}
            {!loading && !err && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-stone-500"
                >
                  Tidak ada hasil.
                </td>
              </tr>
            )}
            {!loading &&
              !err &&
              rows.map((r) => (
                <Fragment key={r.line_full}>
                  <tr
                    onClick={() => toggle(r.line_full)}
                    className="cursor-pointer border-t border-sand-100 hover:bg-sand-50"
                  >
                    <td className="px-3 py-2.5 font-medium">{r.line_full}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {r.n_brand_dupe}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {num(r.sold_w)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {rp(r.ppm_edp)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {r.opportunity_score ?? "-"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${BADGE[r.kuadran] ?? "bg-stone-100"}`}
                      >
                        {r.kuadran.split(" (")[0]}
                      </span>
                    </td>
                  </tr>
                  {open === r.line_full && (
                    <tr className="bg-sand-50">
                      <td colSpan={6} className="px-4 py-3">
                        {!detail ? (
                          <span className="text-stone-500">
                            Memuat produk lokal...
                          </span>
                        ) : !detail.ditemukan ? (
                          <span>{detail.pesan}</span>
                        ) : (
                          <div>
                            <p className="mb-2 text-xs text-stone-500">
                              Produk lokal yang diduga dupe (urut terlaris):
                            </p>
                            <ul className="grid gap-1 sm:grid-cols-2">
                              {detail.produk_lokal_berlabel_dupe
                                ?.slice(0, 8)
                                .map((p) => (
                                  <li
                                    key={p.variant_id || p.id_parfume}
                                    className="flex justify-between gap-3 rounded-lg bg-white px-3 py-1.5"
                                  >
                                    <span>
                                      {p.brand} {p.variant}
                                    </span>
                                    <span className="shrink-0 text-stone-500 tabular-nums">
                                      {rp(p.price_median ?? p.price_mid)} ·{" "}
                                      {num(p.sold_total ?? p.sold_est)}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                            {r.notes_umum && (
                              <p className="mt-2 text-xs text-stone-500">
                                Aroma umum: {r.notes_umum}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && !err && (
        <p className="mt-2 text-xs text-stone-500">
          Menampilkan {rows.length} dari {total} original.
        </p>
      )}
    </main>
  );
}
