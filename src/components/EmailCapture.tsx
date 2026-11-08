"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function EmailCapture({
  compact = false,
  cta = "Start for free",
}: {
  compact?: boolean;
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setState("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setMessage(data.message ?? "Welcome aboard.");
      } else {
        setState("error");
        setMessage(data.message ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error — please try again.");
    }
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#7ee2a8]/30 bg-[#7ee2a8]/10 px-5 py-4">
        <CheckCircle2 size={26} className="shrink-0 text-[#7ee2a8]" />
        <div>
          <p className="text-sm font-bold text-[#7ee2a8]">You’re on the list.</p>
          <p className="text-xs text-[#c9c5b8]">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "max-w-md"}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-2xl border border-white/15 bg-black/50 px-4 backdrop-blur-md transition focus-within:border-[#e4b45c]/60">
          <Mail size={17} className="shrink-0 text-[#9a978c]" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter your email"
            aria-label="Email address"
            className="w-full bg-transparent py-3.5 text-sm text-[#f4efe6] outline-none placeholder:text-[#75726a]"
          />
        </label>
        <button
          onClick={submit}
          disabled={state === "loading"}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#e4b45c] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[#0b0c0e] transition hover:bg-[#f6d68a] disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 size={17} className="animate-spin" /> : (<>{cta} <ArrowRight size={16} strokeWidth={2.6} /></>)}
        </button>
      </div>
      <p className={`mt-2 text-[11px] ${state === "error" ? "text-[#f0715c]" : "text-[#75726a]"}`}>
        {state === "error" ? message : "Free to start · no credit card required · cancel anytime. You agree to receive Vendora marketing emails."}
      </p>
    </div>
  );
}
