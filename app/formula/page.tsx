"use client";
import { useState } from "react";

interface FormulaResult {
  genre: string;
  desc: string;
  targetMl: number;
  concentration: string;
  alcoholMl: number;
  fixativeMl: number;
  totalCompoundMl: number;
  breakdown: {
    layer: string;
    name: string;
    ml: number;
    pct: number;
    reason: string;
  }[];
}

const GENRES = [
  { id: "clean", label: "Clean, Soapy & Fresh (Ala Laundry/Sabun Mewah)" },
  { id: "gourmand", label: "Sweet Gourmand & Vanilla (Ala Kue/Karamel)" },
  { id: "fresh_citrus", label: "Fresh Citrus & Aquatic (Ala Musim Panas/Sporty)" },
  { id: "woody_luxury", label: "Woody & Amber Luxury (Ala Niche/Dark Seductive)" },
];

export default function FormulaGenerator() {
  const [genre, setGenre] = useState(GENRES[0].id);
  const [totalMl, setTotalMl] = useState(100);
  const [concentration, setConcentration] = useState(25); // 25% Extrait
  const [result, setResult] = useState<FormulaResult | null>(null);

  function generate() {
    const totalCompound = (totalMl * concentration) / 100;
    const alcohol = totalMl - totalCompound - (totalMl * 0.05);
    const fixative = totalMl * 0.05;

    let desc = "";
    let breakdown = [];

    const concName = concentration === 15 ? "Eau de Parfum (15%)" : concentration === 20 ? "Extrait Standar (20%)" : concentration === 25 ? "Extrait Luxury (25%)" : "Concentrated Oil (30%)";

    if (genre === "clean") {
      desc = "Karakter wangi sabun mandi mewah dan pakaian bersih yang segar (*soapy-clean*), sangat cocok untuk cuaca tropis.";
      breakdown = [
        { layer: "Top Notes", name: "Clean Aldehydes", ml: totalCompound * 0.16, pct: 16, reason: "Memberikan sensasi tajam, berkilau, dan kesan pakaian baru disetrika." },
        { layer: "Top Notes", name: "Bergamot & Mandarin Zest", ml: totalCompound * 0.10, pct: 10, reason: "Kesegaran pembuka citrus cerah untuk menghempas gerah." },
        { layer: "Mid Notes", name: "White Soap Accord & Lily of the Valley", ml: totalCompound * 0.28, pct: 28, reason: "Jantung wangi sabun busa mewah dan bunga putih bersih." },
        { layer: "Mid Notes", name: "White Tea Vapor", ml: totalCompound * 0.14, pct: 14, reason: "Memberikan kesan sejuk berangin (*airy*) yang menenangkan." },
        { layer: "Base Notes", name: "Clean Musk & Cashmeran", ml: totalCompound * 0.20, pct: 20, reason: "Aroma kulit bersih sehabis mandi yang menempel lembut di tubuh." },
        { layer: "Base Notes", name: "Iso E Super / Ambroxan", ml: totalCompound * 0.12, pct: 12, reason: "Penguat jejak wangi (*sillage enhancer*) agar menyebar luas." },
      ];
    } else if (genre === "gourmand") {
      desc = "Karakter manis legit, hangat, dan bikin ketagihan (*addictive sweet caramel-vanilla*).";
      breakdown = [
        { layer: "Top Notes", name: "Pink Pepper & Orange Zest", ml: totalCompound * 0.10, pct: 10, reason: "Kejutan rempah lembut agar manisnya tidak langsung bikin enek." },
        { layer: "Mid Notes", name: "Caramel & Condensed Milk", ml: totalCompound * 0.34, pct: 34, reason: "Inti karamel leleh dan susu yang manis legit." },
        { layer: "Mid Notes", name: "Coffee Absolute", ml: totalCompound * 0.14, pct: 14, reason: "Pemberi kesan pahit manis espresso penyeimbang karamel." },
        { layer: "Base Notes", name: "Madagascar Vanilla & Tonka Bean", ml: totalCompound * 0.26, pct: 26, reason: "Vanila kualitas tinggi yang hangat dan tahan lama." },
        { layer: "Base Notes", name: "White Musk & Amber", ml: totalCompound * 0.16, pct: 16, reason: "Jangkar sensual yang menyatukan aroma dengan kulit." },
      ];
    } else if (genre === "fresh_citrus") {
      desc = "Karakter buah segar dan aroma laut yang sangat menyegarkan (*energizing aquatic citrus*).";
      breakdown = [
        { layer: "Top Notes", name: "Calabrian Bergamot & Grapefruit", ml: totalCompound * 0.25, pct: 25, reason: "Ledakan kesegaran citrus ultra-terang di awal semprotan." },
        { layer: "Top Notes", name: "Marine & Ozone Notes", ml: totalCompound * 0.15, pct: 15, reason: "Nuansa angin laut asin yang sejuk." },
        { layer: "Mid Notes", name: "Green Apple & Mint", ml: totalCompound * 0.20, pct: 20, reason: "Sentuhan buah hijau renyah dan dingin mint." },
        { layer: "Base Notes", name: "Ambroxan & White Musk", ml: totalCompound * 0.25, pct: 25, reason: "Pengikat aroma laut agar tahan lama di cuaca panas." },
        { layer: "Base Notes", name: "Cedarwood", ml: totalCompound * 0.15, pct: 15, reason: "Sentuhan kayu kering yang maskulin dan bersih." },
      ];
    } else {
      desc = "Karakter kayu mewah, misterius, dan berkelas tinggi (*deep woody & seductive*).";
      breakdown = [
        { layer: "Top Notes", name: "Cardamom & Saffron", ml: totalCompound * 0.15, pct: 15, reason: "Rempah hangat eksotis pembuka yang mewah." },
        { layer: "Mid Notes", name: "Sandalwood & Orris Root", ml: totalCompound * 0.35, pct: 35, reason: "Kayu cendana lembut berbedak (*powdery woody*)." },
        { layer: "Base Notes", name: "Oud Wood & Patchouli", ml: totalCompound * 0.30, pct: 30, reason: "Gaharu gelap yang elegan dan mendalam." },
        { layer: "Base Notes", name: "Amber Resin & Vanilla", ml: totalCompound * 0.20, pct: 20, reason: "Pemberi kehangatan dan keawetan maksimal." },
      ];
    }

    setResult({
      genre: GENRES.find((g) => g.id === genre)?.label || "",
      desc,
      targetMl: totalMl,
      concentration: concName,
      alcoholMl: Number(alcohol.toFixed(1)),
      fixativeMl: Number(fixative.toFixed(1)),
      totalCompoundMl: Number(totalCompound.toFixed(1)),
      breakdown,
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl">Formula Generator & Kalkulator Bibit</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Alat bantu peracik parfum mandiri. Pilih genre wangi, tentukan ukuran botol dan konsentrasi, lalu sistem akan menghitung takaran mililiter (ml) beserta alasan ilmiah setiap bahan secara otomatis.
      </p>

      {/* Kontrol Input */}
      <div className="mt-6 grid gap-4 rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Pilih Genre Wangi</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="mt-2 w-full rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
          >
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Ukuran Botol Target (ml)</label>
          <select
            value={totalMl}
            onChange={(e) => setTotalMl(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
          >
            <option value={30}>30 ml (Travel Size)</option>
            <option value={50}>50 ml (Standard)</option>
            <option value={100}>100 ml (Full Size)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Konsentrasi Parfum</label>
          <select
            value={concentration}
            onChange={(e) => setConcentration(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
          >
            <option value={15}>Eau de Parfum (15% Bibit)</option>
            <option value={20}>Extrait Standar (20% Bibit)</option>
            <option value={25}>Extrait Luxury (25% Bibit)</option>
            <option value={30}>Concentrated Oil (30% Bibit)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={generate}
          className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-white shadow-md transition hover:bg-stone-800"
        >
          Hitung & Buat Formula Racikan
        </button>
      </div>

      {/* Hasil Formula */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border-2 border-gold-500 bg-white p-6 shadow-sm">
            <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-800">
              Blueprint Formula Terkalkulasi
            </span>
            <h2 className="font-display mt-2 text-2xl">{result.genre}</h2>
            <p className="mt-1 text-sm text-stone-600">{result.desc}</p>

            {/* Rangkuman Pelarut */}
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-sand-50 p-4 text-center text-sm">
              <div>
                <span className="block text-xs text-stone-500">Total Bibit</span>
                <span className="font-bold text-ink">{result.totalCompoundMl} ml</span>
              </div>
              <div>
                <span className="block text-xs text-stone-500">Alkohol 96%</span>
                <span className="font-bold text-ink">{result.alcoholMl} ml</span>
              </div>
              <div>
                <span className="block text-xs text-stone-500">Fixative / Pengikat</span>
                <span className="font-bold text-ink">{result.fixativeMl} ml</span>
              </div>
            </div>

            {/* Tabel Rician Notes */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-sand-200">
              <table className="w-full text-sm">
                <thead className="bg-sand-100 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-3 py-2.5">Layer</th>
                    <th className="px-3 py-2.5">Nama Bahan / Accord</th>
                    <th className="px-3 py-2.5 text-right">Takaran (ml)</th>
                    <th className="px-3 py-2.5 text-right">Proporsi</th>
                    <th className="px-3 py-2.5">Alasan & Fungsi Ilmiah</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((b, i) => (
                    <tr key={i} className="border-t border-sand-100 hover:bg-sand-50">
                      <td className="px-3 py-3 font-medium text-gold-700">{b.layer}</td>
                      <td className="px-3 py-3 font-medium">{b.name}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-semibold">{b.ml.toFixed(1)} ml</td>
                      <td className="px-3 py-3 text-right tabular-nums">{b.pct}%</td>
                      <td className="px-3 py-3 text-xs text-stone-500">{b.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
