"use client";
import { useState } from "react";
import Image from "next/image";
import FmDataHub from "@/components/FmDataHub";

interface ChartItem {
  id: string;
  title: string;
  desc: string;
  file: string;
}

const CHARTS: ChartItem[] = [
  { id: "fm", title: "FM-Style Interactive Data Hub", desc: "Dashboard analitik manajerial real-time menggunakan dataset asli backend (249 varian, perbandingan kelompok brand, tahun rilis, dan duel varian).", file: "" },
  { id: "h00", title: "Dashboard A vs B Overview", desc: "Ringkasan visual komparatif kelompok brand.", file: "charts/H00_dashboard_A_vs_B.png" },
  { id: "h01", title: "Kartu Semua Kelompok Brand", desc: "Ringkasan profil metrik lengkap tiap brand.", file: "charts/H01_kartu_semua_kelompok.png" },
  { id: "h02", title: "Heatmap Kelompok x Tahun Rilis", desc: "Distribusi varian per tahun rilis tiap brand.", file: "charts/H02_heatmap_kelompok_x_tahun.png" },
  { id: "h03", title: "Heatmap Original x Tahun Rilis", desc: "Acuan parfum original dunia berdasarkan tahun tren.", file: "charts/H03_heatmap_original_x_tahun.png" },
  { id: "h04", title: "Heatmap Notes x Tahun Rilis", desc: "Pergeseran notes aroma dari tahun ke tahun.", file: "charts/H04_heatmap_notes_x_tahun.png" },
  { id: "h05", title: "Geser Rank Koreksi Tahun Rilis", desc: "Koreksi peringkat original dengan mempertimbangkan faktor usia/tahun rilis.", file: "charts/H05_geser_rank_koreksi_tahun.png" },
  { id: "h06", title: "Duel Varian Komparasi Langsung", desc: "Perbandingan mendalam antar dua varian parfum.", file: "charts/H06_duel_varian.png" },
  { id: "h07", title: "Model ROC Kurva Evaluasi", desc: "Kurva evaluasi performa model Machine Learning.", file: "charts/H07_model_roc.png" },
  { id: "h08", title: "Model Fitur Penting (Feature Importance)", desc: "Atribut terpenting yang memengaruhi prediksi model.", file: "charts/H08_model_fitur_penting.png" },
  { id: "h09", title: "Model Kalibrasi Prediksi", desc: "Grafik kalibrasi probabilitas permintaan pasar.", file: "charts/H09_model_kalibrasi.png" },
  { id: "h10", title: "Model Pengaruh Umur Produk", desc: "Analisis dampak umur produk terhadap penjualan.", file: "charts/H10_model_pengaruh_umur.png" },
  { id: "h11", title: "Saran Konsep & Produk Baru", desc: "Panduan rekomendasi konsep produk baru.", file: "charts/H11_saran_konsep_contoh.png" },
  { id: "h12", title: "Perbedaan Lokal vs Timteng", desc: "Komparasi karakteristik wangi Lokal dan Timur Tengah.", file: "charts/H12_perbedaan_lokal_vs_timteng.png" },
  { id: "c01", title: "Pie Share Per Kelompok Brand", desc: "Pangsa pasar berdasarkan jumlah varian.", file: "charts/01_pie_share_per_kelompok.png" },
  { id: "c02", title: "Pie Dupe Brand Indikator", desc: "Proporsi indikator keberhasilan dupe brand.", file: "charts/02_pie_dupe_brand_indikator.png" },
  { id: "c03", title: "Pie Lokal vs Timteng", desc: "Perbandingan porsi brand lokal dan timteng.", file: "charts/03_pie_lokal_vs_timteng.png" },
  { id: "rev", title: "Estimasi Revenue Per Kelompok Brand", desc: "Perbandingan total omzet kotor brand.", file: "charts/04_bar_revenue_per_kelompok.png" },
  { id: "top", title: "Top 25 Parfum Original Acuan", desc: "Ranking original dunia yang paling banyak didupe.", file: "charts/05_bar_top_original.png" },
  { id: "c06", title: "Bar Notes Lokal vs Timteng", desc: "Perbandingan frekuensi notes dominan.", file: "charts/06_bar_notes_lokal_vs_timteng.png" },
  { id: "c07", title: "Stacked Indikator Bucket", desc: "Distribusi bucket indikator keberhasilan.", file: "charts/07_stacked_indikator_bucket.png" },
  { id: "c08", title: "Heatmap Original x Kelompok", desc: "Matriks sebaran original vs kelompok brand.", file: "charts/08_heatmap_original_x_kelompok.png" },
  { id: "c09", title: "Heatmap Notes Khas Kelompok", desc: "Sebaran notes khas di setiap kelompok brand.", file: "charts/09_heatmap_notes_khas_kelompok.png" },
  { id: "scatter", title: "Peta Kuadran: Pesaing vs Penjualan", desc: "Matriks kuadran peluang produk baru.", file: "charts/10_scatter_ramai_vs_laris.png" },
];

export default function Dashboard() {
  const [selected, setSelected] = useState<ChartItem>(CHARTS[0]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Dashboard Data Hub (FM-Style + Era Analitik)</h1>
          <p className="mt-2 max-w-3xl text-sm text-stone-600">
            Pusat analitik statistik parfum terlengkap berdasarkan data output terbaru. Mencakup FM Hub interaktif dan galeri grafik infografis era/tahun rilis.
          </p>
        </div>
      </div>

      {/* Grid Menu Pilihan */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CHARTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
              selected.id === c.id
                ? "border-gold-500 bg-ink text-white shadow-md"
                : "border-sand-200 bg-white text-stone-700 hover:border-gold-300 hover:bg-sand-50"
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {c.id === "fm" ? "Live FM Hub" : "Infografis Era"}
            </span>
            <span className="mt-1 text-sm font-medium leading-snug">{c.title.split(" (")[0]}</span>
          </button>
        ))}
      </div>

      {/* Tampilan Konten Utama */}
      <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-sand-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl">{selected.title}</h2>
            <p className="mt-1 text-sm text-stone-500">{selected.desc}</p>
          </div>
          <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-medium text-gold-800">
            {selected.id === "fm" ? "FM Engine (Real Backend Data)" : "High-Res Infographic"}
          </span>
        </div>

        <div className="mt-6 w-full">
          {selected.id === "fm" ? (
            <FmDataHub />
          ) : (
            <div className="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-xl bg-sand-50/50 p-4 border border-sand-100">
              <div className="relative h-[650px] w-full">
                <Image
                  src={`/${selected.file}`}
                  alt={selected.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
