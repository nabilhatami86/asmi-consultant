"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icon";
import { API } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

export default function KatalogMaklonPage() {
  const [rekomendasi, setRekomendasi] = useState<any[]>([]);
  const [peluang, setPeluang] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "rekomendasi" | "peluang" | "charts"
  >("rekomendasi");

  const [pageRek, setPageRek] = useState(1);
  const [pagePel, setPagePel] = useState(1);
  const pageSize = 300;

  useEffect(() => {
    async function fetchData() {
      try {
        const res1 = await fetch(`${API}/katalog-maklon/rekomendasi?limit=300`);
        const data1 = await res1.json();
        if (data1.status === "sukses") setRekomendasi(data1.rekomendasi);

        const res2 = await fetch(
          `${API}/katalog-maklon/peluang-belum?limit=300`,
        );
        const data2 = await res2.json();
        if (data2.status === "sukses") setPeluang(data2.peluang);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const paginatedRek = rekomendasi;
  const paginatedPel = peluang;

  const chartList = [
    {
      title: "M1: Cakupan & Prioritas Katalog",
      file: "charts/M1_cakupan_dan_prioritas.png",
    },
    {
      title: "M2: Top Aroma Bukti Langsung",
      file: "charts/M2_top_aroma_bukti_langsung.png",
    },
    {
      title: "M3: Peluang Belum di Katalog",
      file: "charts/M3_peluang_belum_di_katalog.png",
    },
    { title: "M4: Peta Ramai vs Laris", file: "charts/M4_ramai_vs_laris.png" },
  ];

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              Integrasi PT. Resmita Aroma Mandiri (RAM)
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900 mt-2">
              Katalog Aroma Maklon & Bukti Data Shopee
            </h1>
            <p className="text-stone-500 text-xs md:text-sm mt-1">
              Pencocokan katalog aroma PT. RAM dengan data pasar riil Shopee
              untuk rekomendasi produk unggulan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("rekomendasi")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "rekomendasi" ? "bg-ink text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              Rekomendasi Katalog RAM
            </button>
            <button
              onClick={() => setActiveTab("peluang")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "peluang" ? "bg-ink text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              Peluang Belum di Katalog
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "charts" ? "bg-ink text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              Grafik Analisis M1-M4
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-20 rounded-3xl text-center text-stone-500 border border-stone-200 shadow-sm">
            Memuat data katalog maklon dan sinkronisasi Shopee...
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "rekomendasi" && (
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-bold text-stone-900 uppercase">
                    Rekomendasi Aroma Katalog PT. RAM (Terbukti Laris di Shopee)
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Daftar aroma dari pabrik maklon yang memiliki validasi
                    penjualan langsung di marketplace.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead className="bg-stone-100/80 text-stone-700 font-semibold">
                      <tr>
                        <th className="p-3.5">Kategori</th>
                        <th className="p-3.5">Brand</th>
                        <th className="p-3.5">Aroma / Varian</th>
                        <th className="p-3.5">Deskripsi / Notes</th>
                        <th className="p-3.5">Prioritas</th>
                        <th className="p-3.5">Skor Prospek</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {paginatedRek.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50 transition">
                          <td className="p-3.5 font-semibold text-amber-800">
                            {row.kategori || "-"}
                          </td>
                          <td className="p-3.5 font-bold text-stone-900">
                            {row.brand || "-"}
                          </td>
                          <td className="p-3.5 font-bold text-stone-900">
                            {row.aroma || "-"}
                          </td>
                          <td className="p-3.5 text-stone-600 max-w-xs truncate">
                            {row.deskripsi || "-"}
                          </td>
                          <td className="p-3.5 font-bold text-emerald-700">
                            {row.prioritas || "-"}
                          </td>
                          <td className="p-3.5 font-bold text-gold-700">
                            {row.skor_prospek || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "peluang" && (
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-base font-bold text-stone-900 uppercase">
                    Peluang Aroma Potensial (Belum Masuk Katalog RAM)
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Daftar original parfum dengan permintaan pasar tinggi di
                    Shopee namun belum tercantum di katalog pabrik.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead className="bg-stone-100/80 text-stone-700 font-semibold">
                      <tr>
                        <th className="p-3.5">Original / Varian</th>
                        <th className="p-3.5">Kelompok Brand Dupe</th>
                        <th className="p-3.5">Skor Popularitas</th>
                        <th className="p-3.5">Median Terjual</th>
                        <th className="p-3.5">Kuadran Pasar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {paginatedPel.map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50 transition">
                          <td className="p-3.5 font-bold text-stone-900">
                            {row.original_belum_di_katalog ||
                              row.line_full ||
                              row.original ||
                              "-"}
                          </td>
                          <td className="p-3.5 text-stone-600">
                            {row.kelompok_list || "-"}
                          </td>
                          <td className="p-3.5 font-bold text-gold-700">
                            {row.skor_populer_adj ||
                              row.opportunity_score ||
                              "-"}
                          </td>
                          <td className="p-3.5 text-stone-600">
                            {row.sold_lb_median
                              ? `${row.sold_lb_median.toLocaleString()} Pcs`
                              : "-"}
                          </td>
                          <td className="p-3.5 font-semibold text-sky-700">
                            {row.kuadran || "Peluang Emas"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "charts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chartList.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-3"
                  >
                    <h3 className="text-sm font-bold text-stone-900">
                      {c.title}
                    </h3>
                    <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-sand-50 border border-stone-200">
                      <img
                        src={`/${c.file}`}
                        alt={c.title}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
