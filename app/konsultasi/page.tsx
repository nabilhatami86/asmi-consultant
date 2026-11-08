"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icon";

interface ItemSimulasi {
  nama_produk: string;
  konsentrasi: string;
  modal_total: string;
  jumlah_pcs: string;
  harga_jual: string;
}

const KATALOG_PARFUM = [
  "Ex Nihilo Blue Talisman", "9pm Rebel", "HMNS Orgsm", "LV Imagination",
  "PDM Delina", "Paco Rabanne 1 Million", "Creed Silver Mountain", "Creed Aventus"
];

const DEFAULT_ITEMS: ItemSimulasi[] = [
  { nama_produk: "Ex Nihilo Blue Talisman", konsentrasi: "EDP", modal_total: "2.5 Jt", jumlah_pcs: "100", harga_jual: "232 Ribu" },
  { nama_produk: "9pm Rebel", konsentrasi: "EDP", modal_total: "2.5 Jt", jumlah_pcs: "100", harga_jual: "232 Ribu" },
  { nama_produk: "HMNS Orgsm", konsentrasi: "EDP", modal_total: "2.5 Jt", jumlah_pcs: "100", harga_jual: "153 Ribu" },
  { nama_produk: "LV Imagination", konsentrasi: "Extrait", modal_total: "3.1 Jt", jumlah_pcs: "100", harga_jual: "169 Ribu" },
  { nama_produk: "PDM Delina", konsentrasi: "Extrait", modal_total: "3.1 Jt", jumlah_pcs: "100", harga_jual: "169 Ribu" },
  { nama_produk: "Paco Rabanne 1 Million", konsentrasi: "Extrait", modal_total: "3.1 Jt", jumlah_pcs: "100", harga_jual: "169 Ribu" },
  { nama_produk: "Creed Silver Mountain", konsentrasi: "Extrait", modal_total: "3.1 Jt", jumlah_pcs: "100", harga_jual: "169 Ribu" }
];

const DEFAULT_BIAYA = { botol_box: "4 Jt", bpom_halal: "8 Jt", marketing_ads: "5 Jt", dana_darurat: "3 Jt", packaging_alat: "2.5 Jt" };

export default function KonsultasiSPKPage() {
  const [items, setItems] = useState<ItemSimulasi[]>(DEFAULT_ITEMS);
  const [biayaTambahan, setBiayaTambahan] = useState(DEFAULT_BIAYA);
  const [pinjamBri, setPinjamBri] = useState(true);
  const [tenorBri, setTenorBri] = useState(36);
  const [pinjamJatim, setPinjamJatim] = useState(true);
  const [tenorJatim, setTenorJatim] = useState(36);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem("asmi_simulasi_items");
      const savedBiaya = localStorage.getItem("asmi_simulasi_biaya");
      if (savedItems) try { setItems(JSON.parse(savedItems)); } catch (e) {}
      if (savedBiaya) try { setBiayaTambahan(JSON.parse(savedBiaya)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("asmi_simulasi_items", JSON.stringify(items));
    }
  }, [items, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("asmi_simulasi_biaya", JSON.stringify(biayaTambahan));
    }
  }, [biayaTambahan, isClient]);

  const parseNominal = (val: string) => {
    if (!val) return 0;
    const clean = val.toLowerCase().replace(/\s+/g, "");
    let mult = 1;
    if (clean.includes("jt") || clean.includes("juta")) {
      mult = 1_000_000;
    } else if (clean.includes("rb") || clean.includes("ribu")) {
      mult = 1_000;
    } else if (clean.includes("m")) {
      mult = 1_000_000_000;
    }
    
    const num = parseFloat(clean.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return 0;

    // Jika angkanya kecil (misal di bawah 1000 dan user mengetik "153" atau "232"), asumsikan itu adalah ribuan penuh (Rp 153.000 atau Rp 232.000)
    if (num > 0 && num < 1000 && !clean.includes("rb") && !clean.includes("ribu") && !clean.includes("jt") && !clean.includes("juta")) {
      return num * 1_000;
    }

    return num * mult;
  };

  const addItem = () => {
    setItems([...items, { nama_produk: "", konsentrasi: "EDP", modal_total: "2 Jt", jumlah_pcs: "100", harga_jual: "200000" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemSimulasi, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payloadItems = items.map(i => ({
        nama_produk: i.nama_produk || "Produk",
        konsentrasi: i.konsentrasi,
        modal_total: parseNominal(i.modal_total),
        jumlah_pcs: parseInt(i.jumlah_pcs) || 100,
        harga_jual: parseNominal(i.harga_jual)
      }));

      const tambahanTotal = Object.values(biayaTambahan).reduce((acc, v) => acc + parseNominal(v), 0);

      const res = await fetch(`http://localhost:8000/api/konsultasi-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, biaya_tambahan: tambahanTotal, pinjam_bri: pinjamBri, tenor_bri: tenorBri, pinjam_jatim: pinjamJatim, tenor_jatim: tenorJatim })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal simulasi.");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Top Header */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 bg-amber-100 text-amber-800 rounded-full">Modul Keuangan & Utang Bank</span>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-stone-900 mt-2">Simulasi & Perencanaan Modal Bisnis Parfum</h1>
            <p className="text-stone-500 text-xs md:text-sm">Hitung kebutuhan modal maklon, operasional, cicilan KUR, dan proyeksi laba bersih secara akurat.</p>
          </div>
          <button 
            onClick={() => { setItems(DEFAULT_ITEMS); setBiayaTambahan(DEFAULT_BIAYA); localStorage.clear(); }} 
            className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition border border-stone-200 shadow-sm w-full md:w-fit"
          >
            <Icon name="refresh" className="w-4 h-4 text-stone-500" /> Reset Template
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Kolom Kiri: Form Input (5 Span) */}
          <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-3xl p-5 md:p-8 shadow-sm space-y-6">
            
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">1. Sumber Pendanaan (Bank)</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* KUR BRI */}
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-stone-900">
                    <input type="checkbox" checked={pinjamBri} onChange={e => setPinjamBri(e.target.checked)} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" /> 
                    KUR Mikro BRI (Plafon Rp 50 Jt)
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-bold">Cair ~47 Jt</span>
                </div>
                {pinjamBri && (
                  <div>
                    <label className="block text-[10px] font-medium text-stone-500 mb-1">Tenor Cicilan BRI</label>
                    <select value={tenorBri} onChange={e => setTenorBri(Number(e.target.value))} className="w-full bg-white border border-stone-300 rounded-xl p-2 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                      <option value={12}>12 Bulan (~Rp 4.3 Jt/bln)</option>
                      <option value={36}>36 Bulan (~Rp 1.54 Jt/bln - Rekomendasi)</option>
                      <option value={60}>60 Bulan (~Rp 990 Ribu/bln)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* KUR Jatim */}
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-stone-900">
                    <input type="checkbox" checked={pinjamJatim} onChange={e => setPinjamJatim(e.target.checked)} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" /> 
                    KUR Bank Jatim (Plafon Rp 25 Jt)
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-bold">Cair ~22 Jt</span>
                </div>
                {pinjamJatim && (
                  <div>
                    <label className="block text-[10px] font-medium text-stone-500 mb-1">Tenor Cicilan Bank Jatim</label>
                    <select value={tenorJatim} onChange={e => setTenorJatim(Number(e.target.value))} className="w-full bg-white border border-stone-300 rounded-xl p-2 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                      <option value={12}>12 Bulan (~Rp 2.15 Jt/bln)</option>
                      <option value={36}>36 Bulan (~Rp 760 Ribu/bln - Rekomendasi)</option>
                      <option value={48}>48 Bulan (~Rp 587 Ribu/bln)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border-b border-stone-100 pb-3 pt-2">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">2. Biaya Operasional & Pendukung</h2>
              </div>

              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60 grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="block text-[10px] font-medium text-stone-500 mb-1">Box / Botol Tambahan</span>
                  <input value={biayaTambahan.botol_box} onChange={e => setBiayaTambahan({...biayaTambahan, botol_box: e.target.value})} placeholder="4 Jt" className="w-full bg-white border border-stone-300 rounded-xl p-2 font-mono text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-stone-500 mb-1">BPOM & Halal</span>
                  <input value={biayaTambahan.bpom_halal} onChange={e => setBiayaTambahan({...biayaTambahan, bpom_halal: e.target.value})} placeholder="8 Jt" className="w-full bg-white border border-stone-300 rounded-xl p-2 font-mono text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-stone-500 mb-1">Marketing / Ads</span>
                  <input value={biayaTambahan.marketing_ads} onChange={e => setBiayaTambahan({...biayaTambahan, marketing_ads: e.target.value})} placeholder="5 Jt" className="w-full bg-white border border-stone-300 rounded-xl p-2 font-mono text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-stone-500 mb-1">Dana Darurat</span>
                  <input value={biayaTambahan.dana_darurat} onChange={e => setBiayaTambahan({...biayaTambahan, dana_darurat: e.target.value})} placeholder="3 Jt" className="w-full bg-white border border-stone-300 rounded-xl p-2 font-mono text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-medium text-stone-500 mb-1">Packaging, Botol Tester & Alat</span>
                  <input value={biayaTambahan.packaging_alat} onChange={e => setBiayaTambahan({...biayaTambahan, packaging_alat: e.target.value})} placeholder="2.5 Jt" className="w-full bg-white border border-stone-300 rounded-xl p-2 font-mono text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
              </div>

              <div className="border-b border-stone-100 pb-3 pt-2">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">3. Varian Produk Maklon</h2>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/60 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center font-bold text-amber-700">
                      <span>Varian #{idx+1}</span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                          <Icon name="trash" className="w-4 h-4"/>
                        </button>
                      )}
                    </div>
                    <input list={`kat-${idx}`} value={item.nama_produk} onChange={e => updateItem(idx, "nama_produk", e.target.value)} placeholder="Nama Parfum" className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    <datalist id={`kat-${idx}`}>{KATALOG_PARFUM.map((p, i) => <option key={i} value={p}/>)}</datalist>
                    
                    <div className="grid grid-cols-3 gap-1.5">
                      <select value={item.konsentrasi} onChange={e => updateItem(idx, "konsentrasi", e.target.value)} className="bg-white border border-stone-300 rounded-xl p-1.5 text-stone-800 focus:outline-none">
                        <option>EDP</option><option>Extrait</option>
                      </select>
                      <input value={item.modal_total} onChange={e => updateItem(idx, "modal_total", e.target.value)} placeholder="Modal (2.5 Jt)" className="bg-white border border-stone-300 rounded-xl p-1.5 font-mono text-stone-800 focus:outline-none" />
                      <input value={item.harga_jual} onChange={e => updateItem(idx, "harga_jual", e.target.value)} placeholder="Jual (153 Rb)" className="bg-white border border-stone-300 rounded-xl p-1.5 font-mono text-stone-800 focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addItem} className="w-full flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 shadow-sm transition">
                <Icon name="plus" className="w-4 h-4"/> Tambah Varian Baru
              </button>

              <button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md transition tracking-wide">
                {loading ? "Menghitung Analisis..." : "Jalankan Analisis Keuangan & AI"}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Hasil & Analisis (7 Span) */}
          <div className="lg:col-span-7 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">{error}</div>}
            
            {!result && !error && (
              <div className="bg-white border border-stone-200/80 rounded-3xl p-12 md:p-16 text-center text-stone-400 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-600">
                  <Icon name="lightbulb" className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-stone-700">Belum ada simulasi yang dijalankan.</p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">Atur pinjaman bank dan rincian produk di sebelah kiri, lalu klik tombol analisis untuk menampilkan laporan lengkap.</p>
              </div>
            )}

            {result && result.status === "sukses" && (
              <div className="space-y-6">
                
                {/* Kartu Ringkasan Statistik */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Total Maklon</span>
                    <strong className="text-sm md:text-lg font-extrabold text-stone-900 mt-1 block">Rp{result.total_modal_keseluruhan?.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Operasional</span>
                    <strong className="text-sm md:text-lg font-extrabold text-stone-900 mt-1 block">Rp{result.total_biaya_tambahan?.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Total Usaha</span>
                    <strong className="text-sm md:text-lg font-extrabold text-amber-600 mt-1 block">Rp{(result.total_modal_keseluruhan + result.total_biaya_tambahan)?.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase tracking-wider">Cicilan 2 Bank / Bln</span>
                    <strong className="text-sm md:text-lg font-extrabold text-emerald-600 mt-1 block">Rp{result.cicilan_bank_per_bulan?.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Kotak Analisis AI */}
                <div className="bg-white border border-amber-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                      <Icon name="lightbulb" className="w-5 h-5"/>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 tracking-wide">Analisis AI & Kelayakan Keuangan</h3>
                  </div>
                  <div className="bg-sand-50 p-4 md:p-5 rounded-2xl border border-stone-200/80 text-xs text-stone-800 font-mono whitespace-pre-line leading-relaxed shadow-inner overflow-x-auto">
                    {result.saran_ai_analisis}
                  </div>
                </div>

                {/* Tabel Rincian Varian (Responsive dengan horizontal scroll khusus mobile) */}
                <div className="bg-white border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-stone-800 uppercase tracking-wide">Rincian Per Varian & E-Commerce</h3>
                  <div className="w-full overflow-x-auto rounded-2xl border border-stone-200/80">
                    <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                      <thead className="bg-stone-100/80 text-stone-700 font-semibold">
                        <tr>
                          <th className="p-3.5">Produk</th>
                          <th className="p-3.5">Modal/Pcs</th>
                          <th className="p-3.5">Harga Jual</th>
                          <th className="p-3.5">Shopee (S1 / S3)</th>
                          <th className="p-3.5">TikTok Shop</th>
                          <th className="p-3.5">Laba Bersih</th>
                          <th className="p-3.5">Target/Hari</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {result.hasil_simulasi?.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-stone-50 transition">
                            <td className="p-3.5 font-bold text-stone-900">
                              {row.nama_produk} <span className="text-stone-400 font-normal">({row.konsentrasi})</span>
                            </td>
                            <td className="p-3.5">Rp{row.hpp_satuan?.toLocaleString()}</td>
                            <td className="p-3.5 font-medium">Rp{row.harga_jual?.toLocaleString()}</td>
                            <td className="p-3.5 text-stone-600">
                              S1: <span className="text-emerald-700 font-medium">Rp{row.rincian_ecommerce?.shopee_tanpa_program?.laba?.toLocaleString()}</span><br/>
                              S3: <span className="text-amber-700 font-medium">Rp{row.rincian_ecommerce?.shopee_gox_9?.laba?.toLocaleString()}</span>
                            </td>
                            <td className="p-3.5 text-sky-700 font-medium">
                              Rp{row.rincian_ecommerce?.tiktok_shop?.laba?.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-emerald-700 font-bold">Rp{row.laba_total?.toLocaleString()}</td>
                            <td className="p-3.5 font-semibold text-stone-800">{row.target_jual_per_hari} Pcs/hari</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
