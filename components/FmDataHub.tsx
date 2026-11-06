"use client";
import { useEffect, useRef } from "react";
// @ts-ignore
import Chart from "chart.js/auto";
import { D, KS } from "@/lib/realParfumData";

export default function FmDataHub() {
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const yrChartRef = useRef<HTMLCanvasElement>(null);
  const bkChartRef = useRef<HTMLCanvasElement>(null);
  const scChartRef = useRef<HTMLCanvasElement>(null);
  const mdChartRef = useRef<HTMLCanvasElement>(null);
  const vrChartRef = useRef<HTMLCanvasElement>(null);

  const saRef = useRef<HTMLSelectElement>(null);
  const sbRef = useRef<HTMLSelectElement>(null);
  const vaRef = useRef<HTMLSelectElement>(null);
  const vbRef = useRef<HTMLSelectElement>(null);

  const kpisRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const hmRef = useRef<HTMLDivElement>(null);
  const viRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const C = (n: string) => cs.getPropertyValue(n).trim() || "#38bdf8";

    const med = (a: (number | null)[]) => {
      const clean = a.filter((x): x is number => x != null).sort((x, y) => x - y);
      if (!clean.length) return 0;
      const m = clean.length >> 1;
      return clean.length % 2 ? clean[m] : (clean[m - 1] + clean[m]) / 2;
    };

    const pct = (arr: typeof D, f: (x: typeof D[0]) => boolean) =>
      arr.length ? (100 * arr.filter(f).length) / arr.length : 0;

    const fmt = (n: number) =>
      n >= 1e6 ? (n / 1e6).toFixed(1) + "jt" : n >= 1e3 ? (n / 1e3).toFixed(0) + "rb" : Math.round(n);

    const st = (k: string) => {
      const r = D.filter((x) => x.k === k);
      return {
        n: r.length,
        harga: med(r.map((x) => x.p)),
        sold: med(r.map((x) => x.s)),
        top: pct(r.filter((x) => x.s != null), (x) => (x.s ?? 0) >= 10000),
        fav: pct(r, (x) => x.f === 1),
        skor: r.length ? r.reduce((s, x) => s + x.i, 0) / r.length : 0,
        umur: med(r.map((x) => x.a)),
        ext: pct(r, (x) => x.c === 1),
        rev: r.reduce((s, x) => s + (x.s || 0) * x.p, 0) / 1e9,
      };
    };

    const S: Record<string, ReturnType<typeof st>> = Object.fromEntries(KS.map((k) => [k, st(k)]));
    const AX: [keyof ReturnType<typeof st>, string][] = [
      ["n", "Jumlah varian"],
      ["harga", "Harga median"],
      ["sold", "Median terjual"],
      ["top", "% 10000+"],
      ["fav", "% fav"],
      ["skor", "Skor status"],
      ["umur", "Umur median (bln)"],
      ["ext", "% Extrait"],
    ];

    const mx: Record<string, number> = Object.fromEntries(
      AX.map(([k]) => [k, Math.max(...KS.map((g) => S[g][k] as number)) || 1])
    );

    const YR = [...new Set(D.map((x) => x.y))].sort();
    const Y2 = (y: number) => (y <= 2020 ? "≤2020" : "" + y);
    const YL = [...new Set(YR.map(Y2))];

    if (kpisRef.current) {
      const totalRev = D.reduce((s, x) => s + (x.s || 0) * x.p, 0) / 1e9;
      const topBucket = pct(D.filter((x) => x.s != null), (x) => (x.s ?? 0) >= 10000);
      const medianAge = med(D.map((x) => x.a));

      kpisRef.current.innerHTML = [
        ["Varian", D.length],
        ["Kelompok", KS.length],
        ["Revenue floor (Rp miliar)", totalRev.toFixed(1)],
        ["% bucket 10000+", topBucket.toFixed(0) + "%"],
        ["Umur median (bln)", medianAge.toFixed(0)],
      ]
        .map(([a, b]) => `<div style="background:#172033;border:1px solid #2a3753;border-radius:10px;padding:12px"><small style="color:#8fa0bf">${a}</small><b style="display:block;font-size:22px;color:#e8edf7">${b}</b></div>`)
        .join("");
    }

    const byRev = [...KS].sort((a, b) => S[b].rev - S[a].rev);

    const populateSelect = (el: HTMLSelectElement | null, list: string[]) => {
      if (!el) return;
      el.innerHTML = list.map((t) => `<option value="${t}">${t}</option>`).join("");
    };

    populateSelect(saRef.current, byRev);
    populateSelect(sbRef.current, byRev);
    if (sbRef.current && byRev[1]) sbRef.current.value = byRev[1];

    const ch: Record<string, Chart> = {};
    const mk = (id: string, canvasEl: HTMLCanvasElement | null, cfg: any) => {
      if (!canvasEl) return;
      if (ch[id]) {
        ch[id].destroy();
      }
      ch[id] = new Chart(canvasEl, cfg);
    };

    const baseCfg = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#e8edf7" } } },
    };
    const axCfg = { ticks: { color: "#8fa0bf" }, grid: { color: "#2a3753" } };

    const cmp = () => {
      const a = saRef.current?.value || byRev[0];
      const b = sbRef.current?.value || byRev[1];
      const A = S[a];
      const B = S[b];

      mk("radar", radarChartRef.current, {
        type: "radar",
        data: {
          labels: AX.map((x) => x[1]),
          datasets: [a, b].map((g, i) => ({
            label: g,
            data: AX.map(([k]) => 100 * (S[g][k] as number) / mx[k]),
            borderColor: i ? "#f59e0b" : "#38bdf8",
            backgroundColor: (i ? "#f59e0b" : "#38bdf8") + "33",
            pointRadius: 3,
          })),
        },
        options: {
          ...baseCfg,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { display: false },
              grid: { color: "#2a3753" },
              angleLines: { color: "#2a3753" },
              pointLabels: { color: "#e8edf7", font: { size: 11 } },
            },
          },
        },
      });

      const allRows: [keyof ReturnType<typeof st>, string][] = [...AX, ["rev", "Revenue floor (Rp M)"]];
      if (rowsRef.current) {
        rowsRef.current.innerHTML =
          `<div style="display:grid;grid-template-columns:1fr 110px 1fr;gap:8px;align-items:center;margin:6px 0;font-size:12px"><b style="color:#38bdf8">${a}</b><span></span><b style="color:#f59e0b;text-align:right">${b}</b></div>` +
          allRows
            .map(([k, l]) => {
              const av = A[k] as number;
              const bv = B[k] as number;
              const m = Math.max(av, bv) || 1;
              const w = av > bv ? "a" : bv > av ? "b" : "";
              const v = (x: number) =>
                k === "harga" ? fmt(x) : k === "sold" ? fmt(x) : x.toFixed(k === "rev" || k === "skor" ? 2 : 0);
              return `<div style="display:grid;grid-template-columns:1fr 110px 1fr;gap:8px;align-items:center;margin:6px 0;font-size:12px">
              <div style="height:16px;background:#0e1420;border-radius:4px;position:relative;overflow:hidden"><i style="position:absolute;top:0;bottom:0;right:0;width:${100 * av / m}%;background:#38bdf8;border-radius:4px"></i><span style="position:absolute;top:0;left:0;font-size:11px;padding:0 5px;line-height:16px;font-weight:${w === "a" ? "700" : "400"}">${v(av)}</span></div>
              <div style="text-align:center;color:#8fa0bf">${l}</div>
              <div style="height:16px;background:#0e1420;border-radius:4px;position:relative;overflow:hidden"><i style="position:absolute;top:0;bottom:0;left:0;width:${100 * bv / m}%;background:#f59e0b;border-radius:4px"></i><span style="position:absolute;top:0;right:0;font-size:11px;padding:0 5px;line-height:16px;font-weight:${w === "b" ? "700" : "400"}">${v(bv)}</span></div>
            </div>`;
            })
            .join("");
      }

      mk("yr", yrChartRef.current, {
        type: "bar",
        data: {
          labels: YL,
          datasets: [a, b].map((g, i) => ({
            label: g,
            backgroundColor: i ? "#f59e0b" : "#38bdf8",
            data: YL.map((y) => D.filter((x) => x.k === g && Y2(x.y) === y).length),
          })),
        },
        options: { ...baseCfg, scales: { x: axCfg, y: { ...axCfg, beginAtZero: true } } },
      });

      const pt = (f: (x: typeof D[0]) => boolean) =>
        D.filter((x) => x.s != null && f(x)).map((x) => ({ x: x.a, y: (x.s ?? 0) + (Math.random() - 0.5) * 300, n: x.n }));

      mk("sc", scChartRef.current, {
        type: "scatter",
        data: {
          datasets: [
            { label: "lainnya", data: pt((x) => x.k !== a && x.k !== b), backgroundColor: "#8fa0bf55", pointRadius: 3 },
            { label: a, data: pt((x) => x.k === a), backgroundColor: "#38bdf8", pointRadius: 5 },
            { label: b, data: pt((x) => x.k === b), backgroundColor: "#f59e0b", pointRadius: 5 },
          ],
        },
        options: {
          ...baseCfg,
          plugins: {
            ...baseCfg.plugins,
            tooltip: {
              callbacks: { label: (c: any) => `${c.raw.n}: ${Math.round(c.raw.x)} bln, ${Math.round(c.raw.y)} terjual` },
            },
          },
          scales: {
            x: { ...axCfg, title: { display: true, text: "umur (bulan)", color: "#8fa0bf" } },
            y: { ...axCfg, title: { display: true, text: "terjual (batas bawah)", color: "#8fa0bf" } },
          },
        },
      });
    };

    const BK: [string, (x: typeof D[0]) => boolean, string][] = [
      ["<1000", (x) => (x.s ?? 0) < 1000, "#fdd0a2"],
      ["1000-4999", (x) => (x.s ?? 0) >= 1000 && (x.s ?? 0) < 5000, "#fdae6b"],
      ["5000-9999", (x) => (x.s ?? 0) >= 5000 && (x.s ?? 0) < 10000, "#e6550d"],
      ["10000+", (x) => (x.s ?? 0) >= 10000, "#7f2704"],
    ];

    mk("bk", bkChartRef.current, {
      type: "bar",
      data: {
        labels: YL,
        datasets: BK.map(([l, f, c]) => ({
          label: l,
          backgroundColor: c,
          data: YL.map((y) => {
            const r = D.filter((x) => x.s != null && Y2(x.y) === y);
            return r.length ? (100 * r.filter(f).length) / r.length : 0;
          }),
        })),
      },
      options: { ...baseCfg, scales: { x: { ...axCfg, stacked: true }, y: { ...axCfg, stacked: true, max: 100 } } },
    });

    mk("md", mdChartRef.current, {
      data: {
        labels: YL,
        datasets: [
          {
            type: "bar",
            label: "median terjual",
            yAxisID: "y",
            backgroundColor: "#38bdf8",
            data: YL.map((y) => med(D.filter((x) => Y2(x.y) === y).map((x) => x.s))),
          },
          {
            type: "line",
            label: "% 10000+",
            yAxisID: "y2",
            borderColor: "#f59e0b",
            data: YL.map((y) => pct(D.filter((x) => x.s != null && Y2(x.y) === y), (x) => (x.s ?? 0) >= 10000)),
          },
        ],
      },
      options: { ...baseCfg, scales: { x: axCfg, y: { ...axCfg, beginAtZero: true }, y2: { position: "right", grid: { display: false }, ticks: { color: "#8fa0bf" }, min: 0, max: 100 } } },
    });

    if (hmRef.current) {
      let h = `<table style="border-collapse:collapse;width:100%;font-size:12px"><tr><th style="padding:4px 6px;text-align:center;color:#8fa0bf"></th>` + YL.map((y) => `<th style="padding:4px 6px;text-align:center;color:#8fa0bf">${y}</th>`).join("") + "</tr>";
      byRev.forEach((k) => {
        h += `<tr><td style="padding:4px 6px;text-align:left;white-space:nowrap;color:#e8edf7">${k}</td>` +
          YL.map((y) => {
            const r = D.filter((x) => x.k === k && Y2(x.y) === y);
            if (!r.length) return "<td></td>";
            const m = med(r.map((x) => x.s));
            const t = Math.min(1, m / 10000);
            return `<td style="padding:4px 6px;text-align:center;background:rgba(56,189,248,${0.12 + 0.7 * t});color:#fff" title="median terjual ${Math.round(m)}">${r.length}</td>`;
          }).join("") + "</tr>";
      });
      hmRef.current.innerHTML = h + "</table>";
    }

    const V = [...D].sort((x, y) => (y.s || 0) - (x.s || 0));
    populateSelect(vaRef.current, V.map((x) => `${x.k} - ${x.n}`));
    populateSelect(vbRef.current, V.map((x) => `${x.k} - ${x.n}`));
    if (vbRef.current && V[1]) vbRef.current.selectedIndex = 1;

    const VA: [keyof typeof D[0], string][] = [
      ["p", "Harga"],
      ["s", "Terjual"],
      ["a", "Umur"],
      ["i", "Skor status"],
      ["c", "Extrait"],
    ];

    const duel = () => {
      const aIdx = vaRef.current?.selectedIndex ?? 0;
      const bIdx = vbRef.current?.selectedIndex ?? 1;
      const a = V[aIdx];
      const b = V[bIdx];
      const m = Object.fromEntries(VA.map(([k]) => [k, Math.max(...D.map((x) => Number(x[k]) || 0)) || 1]));

      mk("vr", vrChartRef.current, {
        type: "radar",
        data: {
          labels: VA.map((x) => x[1]),
          datasets: [a, b].map((r, i) => ({
            label: r.n,
            data: VA.map(([k]) => 100 * Math.max(Number(r[k]) || 0, 0) / m[k]),
            borderColor: i ? "#f59e0b" : "#38bdf8",
            backgroundColor: (i ? "#f59e0b" : "#38bdf8") + "33",
          })),
        },
        options: {
          ...baseCfg,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { display: false },
              grid: { color: "#2a3753" },
              angleLines: { color: "#2a3753" },
              pointLabels: { color: "#e8edf7" },
            },
          },
        },
      });

      if (viRef.current) {
        viRef.current.innerHTML = [a, b]
          .map(
            (r, i) =>
              `<div style="color:${i ? "#f59e0b" : "#38bdf8"}"><b>${r.k} - ${r.n}</b></div><div style="color:#8fa0bf;font-size:11px;margin:2px 0 10px">Rilis ${r.y} (${r.a} bln) | harga ${fmt(r.p)} | terjual ${r.s == null ? "n/a" : fmt(r.s) + "+"} | skor status ${r.i}${r.nr ? " | no restock" : ""}<br>Dupe dari: ${r.d}</div>`
          )
          .join("");
      }
    };

    if (saRef.current) saRef.current.onchange = cmp;
    if (sbRef.current) sbRef.current.onchange = cmp;
    if (vaRef.current) vaRef.current.onchange = duel;
    if (vbRef.current) vbRef.current.onchange = duel;

    cmp();
    duel();

    return () => {
      Object.values(ch).forEach((chart) => chart.destroy());
    };
  }, []);

  return (
    <div style={{ background: "#0e1420", color: "#e8edf7", fontFamily: "system-ui, sans-serif", padding: "20px", borderRadius: "16px" }}>
      <header style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", letterSpacing: ".08em" }}>DATA<span style={{ color: "#38bdf8" }}>HUB</span> PARFUM (FM-STYLE)</h1>
        <div style={{ color: "#8fa0bf", fontSize: "12px", marginTop: "4px" }}>
          Perbandingan brand &amp; varian real berdasarkan backend dataset terbaru. Terjual = batas bawah tertampil di Shopee. Tahun rilis dari kolom release_date.
        </div>
      </header>

      <main style={{ display: "grid", gap: "14px" }}>
        {/* KPIs */}
        <div ref={kpisRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }} />

        {/* Card: Bandingkan Kelompok */}
        <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Bandingkan kelompok (Timteng digabung)</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <b style={{ color: "#38bdf8" }}>A</b>
            <select ref={saRef} style={{ background: "#0e1420", color: "#e8edf7", border: "1px solid #2a3753", borderRadius: "8px", padding: "7px" }} />
            <b style={{ color: "#f59e0b" }}>B</b>
            <select ref={sbRef} style={{ background: "#0e1420", color: "#e8edf7", border: "1px solid #2a3753", borderRadius: "8px", padding: "7px" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px", marginTop: "10px" }}>
            <div style={{ position: "relative", height: "300px" }}><canvas ref={radarChartRef} /></div>
            <div ref={rowsRef} />
          </div>
        </div>

        {/* Grid Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" }}>
          <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Varian per tahun rilis: A vs B</h2>
            <div style={{ position: "relative", height: "300px" }}><canvas ref={yrChartRef} /></div>
          </div>
          <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Sebaran penjualan per tahun rilis (semua, %)</h2>
            <div style={{ position: "relative", height: "300px" }}><canvas ref={bkChartRef} /></div>
            <div style={{ color: "#8fa0bf", fontSize: "11px", marginTop: "6px" }}>Produk lama punya waktu lebih lama menumpuk penjualan, jadi bandingkan dalam tahun yang sama.</div>
          </div>
          <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Umur produk vs terjual (A biru, B oranye)</h2>
            <div style={{ position: "relative", height: "300px" }}><canvas ref={scChartRef} /></div>
          </div>
          <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Median terjual &amp; % bucket 10000+ per tahun</h2>
            <div style={{ position: "relative", height: "300px" }}><canvas ref={mdChartRef} /></div>
          </div>
        </div>

        {/* Heatmap */}
        <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Peta kelompok x tahun (angka = jumlah varian, warna = median terjual)</h2>
          <div style={{ overflowX: "auto" }} ref={hmRef} />
        </div>

        {/* Duel Varian */}
        <div style={{ background: "#172033", border: "1px solid #2a3753", borderRadius: "10px", padding: "12px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: ".1em", color: "#8fa0bf" }}>Duel varian</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <b style={{ color: "#38bdf8" }}>A</b>
            <select ref={vaRef} style={{ background: "#0e1420", color: "#e8edf7", border: "1px solid #2a3753", borderRadius: "8px", padding: "7px" }} />
            <b style={{ color: "#f59e0b" }}>B</b>
            <select ref={vbRef} style={{ background: "#0e1420", color: "#e8edf7", border: "1px solid #2a3753", borderRadius: "8px", padding: "7px" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px", marginTop: "10px" }}>
            <div style={{ position: "relative", height: "300px" }}><canvas ref={vrChartRef} /></div>
            <div ref={viRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
