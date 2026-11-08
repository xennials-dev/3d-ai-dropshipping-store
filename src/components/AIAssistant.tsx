"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  X,
  SendHorizonal,
  PackageSearch,
  RotateCcw,
  Cpu,
  Zap,
  Check,
  ChevronDown,
  Activity,
  Layers,
  Settings2,
} from "lucide-react";
import type { AIProviderId, ProviderStatus, DetectedModel } from "@/lib/localAiRouter";

type Msg = {
  role: "user" | "assistant";
  content: string;
  source?: AIProviderId;
  model?: string;
  latencyMs?: number;
};

const SUGGESTIONS = [
  "What are your best sellers?",
  "How fast is shipping?",
  "Is dropshipping still profitable?",
  "Track order VND-2916",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey — I’m **Vendora AI**, your concierge for the whole store. I know the live catalog, real ship times and your order status.\n\nAsk me anything: “best seller under $50”, “track order VND-2916”, or choose your local AI engine (LM Studio / Ollama) via the engine pill above!",
};

function renderRich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[#f6d68a]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);

  // Providers & local AI router state
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>("deterministic");
  const [selectedModel, setSelectedModel] = useState<string>("rule-engine");
  const [isScanning, setIsScanning] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scan providers on mount or when opening
  const fetchProviders = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/ai/models");
      const data = await res.json();
      if (data?.providers) {
        setProviders(data.providers);

        // Load stored preference or pick recommended
        const storedProvider = localStorage.getItem("vendora_ai_provider") as AIProviderId | null;
        const storedModel = localStorage.getItem("vendora_ai_model");

        const targetProvider = storedProvider && data.providers.some((p: ProviderStatus) => p.id === storedProvider && p.isOnline)
          ? storedProvider
          : data.recommended?.provider || "deterministic";

        const matchedProviderObj = data.providers.find((p: ProviderStatus) => p.id === targetProvider);
        const targetModel =
          storedModel && matchedProviderObj?.models.some((m: DetectedModel) => m.id === storedModel)
            ? storedModel
            : matchedProviderObj?.models[0]?.id || data.recommended?.model || "rule-engine";

        setSelectedProvider(targetProvider);
        setSelectedModel(targetModel);
      }
    } catch (err) {
      console.error("Provider scan failed", err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/ai/models")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data?.providers) {
          setProviders(data.providers);
          const storedProvider = localStorage.getItem("vendora_ai_provider") as AIProviderId | null;
          const storedModel = localStorage.getItem("vendora_ai_model");

          const targetProvider =
            storedProvider && data.providers.some((p: ProviderStatus) => p.id === storedProvider && p.isOnline)
              ? storedProvider
              : data.recommended?.provider || "deterministic";

          const matchedProviderObj = data.providers.find((p: ProviderStatus) => p.id === targetProvider);
          const targetModel =
            storedModel && matchedProviderObj?.models.some((m: DetectedModel) => m.id === storedModel)
              ? storedModel
              : matchedProviderObj?.models[0]?.id || data.recommended?.model || "rule-engine";

          setSelectedProvider(targetProvider);
          setSelectedModel(targetModel);
        }
      })
      .catch((err) => console.error("Provider scan failed", err));
    return () => {
      ignore = true;
    };
  }, []);

  const selectEngine = (providerId: AIProviderId, modelId: string) => {
    setSelectedProvider(providerId);
    setSelectedModel(modelId);
    localStorage.setItem("vendora_ai_provider", providerId);
    localStorage.setItem("vendora_ai_model", modelId);
    setShowEngineModal(false);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-10),
          provider: selectedProvider,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "Hmm, I lost my train of thought. Try again?",
          source: data.source ?? selectedProvider,
          model: data.model ?? selectedModel,
          latencyMs: data.latencyMs,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I couldn’t reach the network just now. Orders and catalog questions still work — try again in a moment.",
          source: "deterministic",
          model: "rule-engine",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  // global openers used by header / product pages
  useEffect(() => {
    const openOnly = () => setOpen(true);
    const ask = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setOpen(true);
      if (typeof detail === "string" && detail.trim()) {
        setTimeout(() => send(detail), 150);
      }
    };
    window.addEventListener("vendora:open-ai", openOnly);
    window.addEventListener("vendora:ask-ai", ask as EventListener);
    return () => {
      window.removeEventListener("vendora:open-ai", openOnly);
      window.removeEventListener("vendora:ask-ai", ask as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, busy, selectedProvider, selectedModel]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const getProviderBadge = (providerId: AIProviderId) => {
    switch (providerId) {
      case "lmstudio":
        return { label: "LM Studio", icon: Zap, color: "text-[#7ee2a8]", border: "border-[#7ee2a8]/30", bg: "bg-[#7ee2a8]/10" };
      case "ollama":
        return { label: "Ollama", icon: Cpu, color: "text-[#93c5fd]", border: "border-[#93c5fd]/30", bg: "bg-[#93c5fd]/10" };
      case "openai":
        return { label: "OpenAI", icon: Sparkles, color: "text-[#f6d68a]", border: "border-[#f6d68a]/30", bg: "bg-[#f6d68a]/10" };
      case "deterministic":
      default:
        return { label: "Offline Rules", icon: Layers, color: "text-[#f59e0b]", border: "border-[#f59e0b]/30", bg: "bg-[#f59e0b]/10" };
    }
  };

  const badge = getProviderBadge(selectedProvider);
  const BadgeIcon = badge.icon;

  return (
    <>
      {/* floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Vendora AI"
        className="group fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f6d68a] via-[#e4b45c] to-[#8a6a24] shadow-[0_18px_50px_-10px_rgba(228,180,92,0.55)] transition-transform hover:scale-105 active:scale-95"
      >
        <span className="ping-dot absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#7ee2a8]" />
        <Sparkles size={26} className="text-[#0b0c0e] transition-transform duration-500 group-hover:rotate-12" strokeWidth={2.2} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 48, scale: 0.94 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#121318] shadow-2xl sm:bottom-5 sm:right-5 sm:h-[680px] sm:max-h-[90vh] sm:w-[440px] sm:rounded-3xl sm:border sm:border-[#e4b45c]/25"
              role="dialog"
              aria-label="Vendora AI assistant"
            >
              {/* Header */}
              <div className="relative border-b border-white/10 bg-gradient-to-r from-[#e4b45c]/12 via-transparent to-transparent px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f6d68a] to-[#8a6a24] shadow-md">
                    <Sparkles size={18} className="text-[#0b0c0e]" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121318] bg-[#7ee2a8]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-black leading-none text-[#f4efe6]">Vendora AI</p>
                      <span className="rounded-full bg-[#7ee2a8]/10 px-2 py-0.5 text-[9px] font-bold text-[#7ee2a8]">
                        Online
                      </span>
                    </div>
                    {/* Active Router Pill */}
                    <button
                      onClick={() => setShowEngineModal(!showEngineModal)}
                      className="mt-1 flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#c4c0b4] transition hover:bg-white/10 hover:text-white"
                      title="Click to switch AI Engine (LM Studio / Ollama / OpenAI / Rules)"
                    >
                      <BadgeIcon size={11} className={badge.color} />
                      <span className="truncate max-w-[170px] font-mono">
                        {badge.label}: {selectedModel}
                      </span>
                      <ChevronDown size={10} className="text-[#75726a]" />
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => setShowEngineModal(!showEngineModal)}
                      className={`rounded-lg p-1.5 transition ${showEngineModal ? "bg-[#e4b45c] text-[#0b0c0e]" : "text-[#9a978c] hover:bg-white/5 hover:text-white"}`}
                      title="AI Engine Router settings"
                      aria-label="Engine settings"
                    >
                      <Settings2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setMessages([GREETING]);
                      }}
                      className="rounded-lg p-1.5 text-[#75726a] transition hover:bg-white/5 hover:text-white"
                      title="Reset conversation"
                      aria-label="Reset conversation"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded-lg p-1.5 text-[#9a978c] transition hover:bg-white/5 hover:text-white"
                      aria-label="Close"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                {/* AI Engine Selector Panel Modal (Dropdown overlay) */}
                <AnimatePresence>
                  {showEngineModal && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-3 rounded-2xl border border-white/15 bg-[#0b0c0e] p-3 shadow-2xl"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <Cpu size={14} className="text-[#f6d68a]" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#f4efe6]">
                            AI Engine Router
                          </span>
                        </div>
                        <button
                          onClick={fetchProviders}
                          disabled={isScanning}
                          className="flex items-center gap-1 text-[10px] text-[#e4b45c] hover:underline disabled:opacity-50"
                        >
                          <Activity size={10} />
                          {isScanning ? "Scanning..." : "Rescan"}
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {providers.map((p) => {
                          const isSelected = selectedProvider === p.id;
                          const pBadge = getProviderBadge(p.id);
                          const PIcon = pBadge.icon;

                          return (
                            <div
                              key={p.id}
                              className={`rounded-xl border p-2.5 transition ${
                                isSelected
                                  ? "border-[#e4b45c] bg-[#e4b45c]/10"
                                  : p.isOnline
                                  ? "border-white/10 bg-white/5 hover:border-white/20"
                                  : "border-white/5 bg-white/[0.02] opacity-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${pBadge.bg}`}>
                                    <PIcon size={13} className={pBadge.color} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-semibold text-[#f4efe6]">{p.name}</p>
                                      {p.isOnline ? (
                                        <span className="h-2 w-2 rounded-full bg-[#7ee2a8]" title="Online" />
                                      ) : (
                                        <span className="h-2 w-2 rounded-full bg-[#ef4444]" title="Offline" />
                                      )}
                                    </div>
                                    <p className="text-[10px] font-mono text-[#8c887e]">
                                      {p.endpoint} {p.latencyMs ? `· ${p.latencyMs}ms` : ""}
                                    </p>
                                  </div>
                                </div>

                                {p.isOnline && (
                                  <button
                                    onClick={() => selectEngine(p.id, p.models[0]?.id || "default")}
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                                      isSelected
                                        ? "bg-[#e4b45c] text-[#0b0c0e]"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                                  >
                                    {isSelected ? <Check size={12} className="inline mr-1" /> : null}
                                    {isSelected ? "Active" : "Select"}
                                  </button>
                                )}
                              </div>

                              {/* Model Selector if Provider has multiple models and is selected */}
                              {isSelected && p.models.length > 1 && (
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                                  <span className="text-[10px] text-[#75726a] font-medium">Model:</span>
                                  <select
                                    value={selectedModel}
                                    onChange={(e) => selectEngine(p.id, e.target.value)}
                                    className="flex-1 rounded-md bg-[#121318] border border-white/15 px-2 py-1 text-[11px] text-[#f4efe6] outline-none"
                                  >
                                    {p.models.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.name} {m.size ? `(${m.size})` : ""}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-[#75726a]">
                        <span>Zero external cloud required for local engines</span>
                        <button
                          onClick={() => setShowEngineModal(false)}
                          className="text-[#f6d68a] hover:underline font-medium"
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Messages viewport */}
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[82%] rounded-2xl rounded-br-md bg-[#e4b45c] px-4 py-2.5 text-sm font-medium leading-snug text-[#0b0c0e]"
                          : "max-w-[88%] rounded-2xl rounded-bl-md border border-white/10 bg-[#0b0c0e] px-4 py-3 text-[13px] leading-relaxed text-[#e8e4d8]"
                      }
                    >
                      <p className="whitespace-pre-line">{renderRich(m.content)}</p>

                      {/* Source attribution footer */}
                      {m.role === "assistant" && m.source && (
                        <div className="mt-2 flex items-center gap-1.5 pt-1.5 border-t border-white/10 text-[10px] text-[#75726a] font-mono">
                          <span className="capitalize">{m.source}</span>
                          {m.model ? <span>· {m.model}</span> : null}
                          {m.latencyMs ? <span>· {m.latencyMs}ms</span> : null}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-[#0b0c0e] px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="typing-dot h-2 w-2 rounded-full bg-[#e4b45c]" />
                        ))}
                      </div>
                      <span className="ml-1 text-[11px] text-[#75726a] font-mono">
                        Querying {selectedProvider}...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length <= 2 && (
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-[#e4b45c]/30 bg-[#e4b45c]/5 px-3 py-1.5 text-[11px] font-semibold text-[#f6d68a] transition hover:border-[#e4b45c] hover:bg-[#e4b45c]/15"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div className="border-t border-white/10 p-3 bg-[#121318]">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b0c0e] px-4 focus-within:border-[#e4b45c]/50">
                  <PackageSearch size={17} className="shrink-0 text-[#75726a]" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send(input)}
                    placeholder="Ask about products, shipping, orders…"
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[#5a5850]"
                    aria-label="Message Vendora AI"
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={busy || !input.trim()}
                    className="rounded-xl bg-[#e4b45c] p-2 text-[#0b0c0e] transition hover:bg-[#f6d68a] disabled:opacity-30"
                    aria-label="Send"
                  >
                    <SendHorizonal size={17} strokeWidth={2.3} />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.16em] text-[#5a5850]">
                  <span>
                    Powered by <strong className="text-[#8c887e]">{selectedProvider}</strong> ({selectedModel})
                  </span>
                  <button
                    onClick={() => setShowEngineModal(true)}
                    className="text-[#e4b45c] hover:underline lowercase font-sans font-medium"
                  >
                    change engine
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
