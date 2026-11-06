"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { postChat, postChatPdf, getHealth, ChatMsg, ToolUse } from "@/lib/api";
import Markdown from "@/components/Markdown";

const QUICK = [
  "dupe Black Opium apa saja?",
  "peluang original apa yang sepi pesaing?",
  "parfum vanilla caramel di bawah 200rb",
  "notes apa yang paling laris?",
  "orang indonesia suka parfum apa?",
  "bandingkan mykonos dengan bsp",
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya **ASMI Consultant**, konsultan AI dan pakar riset pasar parfum Anda. Anda bisa menanyakan apa saja seputar data riset lokal, perbandingan brand, rekomendasi aroma, atau **mengunggah file PDF (seperti daftar dupe atau riset Anda)** untuk saya analisa.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"groq" | "demo" | null>(null);
  const [toolsUsed, setToolsUsed] = useState<ToolUse[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // PDF Upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPrompt, setPdfPrompt] = useState("Tolong analisa daftar dupe/riset dalam PDF ini:");
  const [isPending, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getHealth()
      .then((h) => setMode(h.mode))
      .catch(() => setMode(null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(textToSend?: string) {
    const text = textToSend ?? input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMsg = { role: "user", content: text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    if (!textToSend) setInput("");
    setLoading(true);
    setToolsUsed([]);
    setNotice(null);

    try {
      const out = await postChat(nextMsgs);
      setMessages([...nextMsgs, { role: "assistant", content: out.answer }]);
      setMode(out.mode);
      setToolsUsed(out.tools || []);
      if (out.notice) setNotice(out.notice);
    } catch {
      setMessages([
        ...nextMsgs,
        { role: "assistant", content: "Gagal terhubung ke backend FastAPI. Pastikan backend sudah berjalan di port 8000." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile || loading) return;

    const uploadMsg: ChatMsg = { role: "user", content: `[Mengunggah PDF: ${pdfFile.name}] ${pdfPrompt}` };
    const nextMsgs = [...messages, uploadMsg];
    setMessages(nextMsgs);
    setLoading(true);
    setToolsUsed([]);
    setNotice(null);

    try {
      const out = await postChatPdf(pdfFile, pdfPrompt);
      setMessages([...nextMsgs, { role: "assistant", content: out.answer }]);
      setPdfFile(null);
    } catch (err: any) {
      setMessages([
        ...nextMsgs,
        { role: "assistant", content: `Gagal memproses file PDF: ${err.message || "Pastikan format PDF valid."}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-6" style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* Mode Status Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-xs text-stone-600 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              mode === "groq" ? "bg-emerald-500 animate-pulse" : mode === "demo" ? "bg-amber-500" : "bg-red-500"
            }`}
          />
          <span className="font-medium">
            {mode === "groq" ? "Mode AI Aktif (Groq LLM + Tools RAG)" : mode === "demo" ? "Mode Demo (Rule-based tanpa API key)" : "Menghubungkan backend..."}
          </span>
        </div>
        {notice && <span className="text-amber-600">{notice}</span>}
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-32">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-ink text-white rounded-br-none"
                  : "bg-white border border-sand-200 text-stone-800 rounded-bl-none"
              }`}
            >
              {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : <p className="whitespace-pre-wrap">{m.content}</p>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-sand-200 bg-white px-5 py-3.5 text-sm text-stone-500 shadow-sm">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gold-500" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gold-500" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gold-500" style={{ animationDelay: "300ms" }} />
              <span className="ml-1 text-xs">ASMI Consultant sedang menganalisis data & dokumen...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts */}
      <div className="fixed bottom-20 left-0 right-0 z-10 bg-gradient-to-t from-sand-50 via-sand-50/80 to-transparent pb-2 pt-4">
        <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-4 no-scrollbar">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="shrink-0 rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 shadow-sm transition hover:border-gold-500 hover:bg-sand-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area + PDF Upload */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-sand-200 bg-sand-50/90 backdrop-blur pb-4 pt-3">
        <div className="mx-auto max-w-4xl px-4">
          {/* PDF Upload Drawer */}
          <details className="mb-2 group">
            <summary className="cursor-pointer text-xs font-medium text-gold-700 hover:underline flex items-center gap-1.5">
              📎 Unggah Dokumen / List Dupe (PDF) untuk dianalisis AI
            </summary>
            <form onSubmit={handlePdfUpload} className="mt-2 flex flex-col gap-2 rounded-xl border border-sand-300 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sand-100 file:text-stone-700 hover:file:bg-sand-200"
              />
              <input
                type="text"
                value={pdfPrompt}
                onChange={(e) => setPdfPrompt(e.target.value)}
                placeholder="Instruksi untuk PDF..."
                className="flex-1 rounded-lg border border-sand-300 px-3 py-1.5 text-xs outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={!pdfFile || loading}
                className="rounded-lg bg-gold-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-gold-700 disabled:opacity-50"
              >
                Analisis PDF
              </button>
            </form>
          </details>

          {/* Text Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 rounded-2xl border border-sand-300 bg-white p-2 shadow-sm focus-within:border-gold-500"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Tulis konsultasi, tanyakan dupe, atau bandingkan brand (Enter untuk kirim)..."
              rows={1}
              className="max-h-32 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-white shadow transition hover:bg-stone-800 disabled:opacity-50"
            >
              Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
