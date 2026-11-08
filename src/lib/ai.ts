import {
  getCatalog,
  catalogPromptBlock,
  lookupOrdersInText,
  type CatalogEntry,
  type StoreStats,
} from "./store";
import {
  type AIProviderId,
  detectLMStudio,
  detectOllama,
} from "./localAiRouter";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type Insight = { tone: "up" | "warn" | "gold" | "info"; title: string; body: string };

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://127.0.0.1:1234/v1";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/* ================= 1. LM STUDIO (LOCAL 1234) ================= */
async function callLMStudio(
  messages: ChatMessage[],
  system: string,
  modelName: string = "qwen2.5-coder-1.5b-instruct"
): Promise<{ text: string; model: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  try {
    const res = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.6,
        max_tokens: 380,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[callLMStudio] HTTP ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return { text: reply, model: data?.model || modelName };
  } catch (err: any) {
    console.warn(`[callLMStudio] Error:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ================= 2. OLLAMA (LOCAL 11434) ================= */
async function callOllama(
  messages: ChatMessage[],
  system: string,
  modelName: string = "qwen2.5:3b"
): Promise<{ text: string; model: string } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "system", content: system }, ...messages],
        stream: false,
        options: {
          temperature: 0.6,
          num_predict: 380,
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[callOllama] HTTP ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const reply = data?.message?.content?.trim();
    if (!reply) return null;
    return { text: reply, model: data?.model || modelName };
  } catch (err: any) {
    console.warn(`[callOllama] Error:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ================= 3. OPENAI CLOUD ================= */
async function callOpenAI(
  messages: ChatMessage[],
  system: string,
  modelName: string = process.env.OPENAI_MODEL || "gpt-4o-mini"
): Promise<{ text: string; model: string } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.6,
        max_tokens: 380,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return { text: reply, model: data?.model || modelName };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ================= 4. DETERMINISTIC LOCAL FALLBACK ================= */
function fmtProducts(list: CatalogEntry[]): string {
  return list
    .map(
      (p) =>
        `• **${p.name}** — $${p.price.toFixed(2)} · ${Math.round(p.margin * 100)}% margin · ships ${p.shippingMin}–${p.shippingMax}d from ${p.supplierCountry} · ★${p.rating} (${p.reviewCount.toLocaleString()})`
    )
    .join("\n");
}

function localReply(messages: ChatMessage[], catalog: CatalogEntry[], orderInfo: string | null): string {
  const lastRaw = messages[messages.length - 1]?.content ?? "";
  const last = lastRaw.toLowerCase();
  const has = (...words: string[]) => words.some((w) => last.includes(w));

  // Order tracking intent
  if (orderInfo && (has("order", "track", "status", "where", "deliver", "package", "parcel") || /VND-\d+/i.test(lastRaw) || /@/.test(lastRaw))) {
    return `Here’s your live order status, pulled straight from our ledger:\n\n${orderInfo
      .split("\n")
      .map((l) => `• ${l}`)
      .join("\n")}\n\nWant live tracking? Head to **/track** and enter the order number — the timeline updates in real time as the supplier scans your parcel.`;
  }
  if (/VND-\d+/i.test(lastRaw) && !orderInfo) {
    return "I couldn’t find that order number in our ledger. Double-check the format (e.g. **VND-2916**) — or head to **/track** and search by the email used at checkout.";
  }

  // Greetings
  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(last.trim())) {
    return "Hey! Great to see you. I can help with **product picks, live prices, shipping times, returns, promo codes** — or track an order if you give me your number like **VND-2916**. What are you shopping for today?";
  }

  // Best sellers / trending
  if (has("best seller", "bestseller", "popular", "trending", "top rated", "recommend", "best product")) {
    const top = [...catalog].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
    return `Our most-loved right now:\n\n${fmtProducts(top)}\n\nWant me to narrow it down — home, tech, fitness or beauty?`;
  }

  // Budget queries
  const under = last.match(/(?:under|below|less than|max|up to)\s*\$?\s?(\d+)/);
  if (under) {
    const cap = Number(under[1]);
    const list = catalog.filter((p) => p.price <= cap).sort((a, b) => b.rating - a.rating).slice(0, 4);
    return list.length
      ? `Great finds under **$${cap}**:\n\n${fmtProducts(list)}\n\nEvery item ships supplier-direct with buyer protection included.`
      : `Nothing under $${cap} right now — our lowest price is **$${Math.min(...catalog.map((p) => p.price)).toFixed(2)}**. Want to see that one?`;
  }

  // Category intents
  const categories: [RegExp, string][] = [
    [/tech|electron|gadget|headphone|watch|power/i, "Electronics"],
    [/home|decor|candle|lamp|vase|blanket|kitchen/i, "Home"],
    [/beauty|skin|serum|makeup|glow/i, "Beauty"],
    [/fitness|gym|sport|water bottle|workout|yoga/i, "Fitness"],
    [/pet|dog|cat|collar/i, "Pets"],
  ];
  for (const [re, cat] of categories) {
    if (re.test(last)) {
      const list = catalog.filter((p) => p.category === cat).sort((a, b) => b.rating - a.rating);
      if (list.length) {
        return `Top ${cat.toLowerCase()} picks from vetted suppliers:\n\n${fmtProducts(list.slice(0, 4))}\n\nWant links to any of these? Just ask — e.g. “tell me about the ${list[0].name}”.`;
      }
    }
  }

  // Margin & profitability
  if (has("margin", "profit", "make money", "profitable", "earn")) {
    return "Straight numbers from our catalog:\n\n• **Cross-border average:** 15–25% net (Trueprofit 2026)\n• **Collective / domestic lanes:** 20–50%\n• **TikTok-organic operators:** 40–60%\n\nOn Vendora, every SKU shows live margin — the PawHaven Reflective Collar runs ~62%, GlowRoot serum ~61%. Bundle accessories and watch your average order value roughly double.";
  }

  // Shipping
  if (has("ship", "delivery", "arrive", "days", "when will", "how long")) {
    return "Delivery depends on the lane:\n\n• **US & Canada partners** (Collective, DropCommerce): **2–7 days**\n• **US/EU AI-matched lanes:** usually **under 7 days**\n• **Cross-border (ePacket-style):** **7–15 business days**\n\nToggle **“Fast-Ship”** in the catalog filters to see only domestic stock. Every order page also shows the live ETA from the supplier.";
  }

  // Returns & refunds
  if (has("return", "refund", "exchange", "money back", "warranty")) {
    return "Easy one. Vendora is the **seller of record**, so you always talk to us — never a factory. Damaged, wrong or missing order? We make it right first (refund or reship), then reconcile with the supplier. You have **30 days** from delivery; start at **/track** → your order → “Request return”.";
  }

  // Promo codes
  if (has("promo", "discount", "coupon", "code", "deal", "sale")) {
    return "Active codes right now:\n\n• **LAUNCH20** — 20% off your first order (store launch offer)\n• **WELCOME10** — 10% off, any time\n\nApply them in the cart drawer. Free shipping unlocks automatically at **$75**.";
  }

  // What is dropshipping
  if (has("what is dropship", "dropshipping", "how does", "how do you work", "business model")) {
    return "Dropshipping = your store sells it, a supplier ships it. You never hold inventory — when a customer orders, the supplier (under your invoice) picks, packs and ships the parcel. You keep the margin; they keep the warehouse. That’s how Vendora works at **$167B market scale** — with AI matching the best supplier for every single order.";
  }

  // Trust & buyer protection
  if (has("scam", "legit", "trust", "safe", "buyer protection", "secure")) {
    return "Fair question. Every Vendora order carries **buyer protection**: payment is held until the supplier scans the parcel, delivery issues are covered by us first, and all suppliers passed a 5-point vetting (history, samples, stock-sync, return policy, retailer reviews). 82,400 stores sell through us — 31M orders delivered.";
  }

  // Fallback — helpful menu
  return `I can help with:\n\n• **“Best sellers”** or “tech under $100”\n• **“Shipping to US?”** or “Track order VND-2916”\n• **“What margin does X have?”**\n• **“Promo codes”** or “How do returns work?”\n\nOr browse everything at **/shop** — LAUNCH20 takes 20% off today.`;
}

/* ================= SMART ROUTER DISPATCH ================= */
export type AIChatOptions = {
  provider?: AIProviderId;
  model?: string;
};

export type AIChatResult = {
  reply: string;
  source: AIProviderId;
  model: string;
  latencyMs: number;
};

export async function aiChat(
  messages: ChatMessage[],
  options: AIChatOptions = {}
): Promise<AIChatResult> {
  const t0 = Date.now();
  const catalog = await getCatalog();
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const orderInfo = await lookupOrdersInText(lastUser).catch(() => null);

  const system = `You are Vendora AI, the concierge inside Vendora — a premium AI-powered dropshipping store (a $167B industry flagship). Be warm, sharp and concise (under 120 words). Use **bold** for key facts. Never invent products, prices or stock — use ONLY the live catalog below. Link products as /product/<slug>. Always be honest about 2–15 day delivery windows and that Vendora is the seller of record handling returns.

LIVE CATALOG:
${catalogPromptBlock(catalog)}

${orderInfo ? `ORDER LOOKUP (from the store ledger, authoritative):\n${orderInfo}\n` : "No order lookup was found in the user's message; if they ask about an order, ask for a number like VND-2916 or the checkout email."}
PROMOS: LAUNCH20 = 20% off first order · WELCOME10 = 10% off · free shipping ≥ $75.`;

  const requestedProvider = options.provider;
  const requestedModel = options.model;

  // 1. Explicit LM Studio Request
  if (requestedProvider === "lmstudio") {
    const res = await callLMStudio(messages.slice(-9), system, requestedModel);
    if (res) {
      return {
        reply: res.text,
        source: "lmstudio",
        model: res.model,
        latencyMs: Date.now() - t0,
      };
    }
  }

  // 2. Explicit Ollama Request
  if (requestedProvider === "ollama") {
    const res = await callOllama(messages.slice(-9), system, requestedModel);
    if (res) {
      return {
        reply: res.text,
        source: "ollama",
        model: res.model,
        latencyMs: Date.now() - t0,
      };
    }
  }

  // 3. Explicit OpenAI Request
  if (requestedProvider === "openai") {
    const res = await callOpenAI(messages.slice(-9), system, requestedModel);
    if (res) {
      return {
        reply: res.text,
        source: "openai",
        model: res.model,
        latencyMs: Date.now() - t0,
      };
    }
  }

  // 4. Auto-detect if no provider was requested or explicit provider failed
  if (!requestedProvider || requestedProvider === "lmstudio") {
    // Try LM Studio first if reachable
    const lm = await detectLMStudio();
    if (lm.isOnline) {
      const activeModel = requestedModel || (lm.models[0]?.id ?? "qwen2.5-coder-1.5b-instruct");
      const res = await callLMStudio(messages.slice(-9), system, activeModel);
      if (res) {
        return {
          reply: res.text,
          source: "lmstudio",
          model: res.model,
          latencyMs: Date.now() - t0,
        };
      }
    }
  }

  // Try Ollama
  if (!requestedProvider || requestedProvider === "ollama") {
    const ol = await detectOllama();
    if (ol.isOnline) {
      const activeModel = requestedModel || (ol.models[0]?.id ?? "qwen2.5:3b");
      const res = await callOllama(messages.slice(-9), system, activeModel);
      if (res) {
        return {
          reply: res.text,
          source: "ollama",
          model: res.model,
          latencyMs: Date.now() - t0,
        };
      }
    }
  }

  // Try OpenAI
  const viaOpenAI = await callOpenAI(messages.slice(-9), system, requestedModel);
  if (viaOpenAI) {
    return {
      reply: viaOpenAI.text,
      source: "openai",
      model: viaOpenAI.model,
      latencyMs: Date.now() - t0,
    };
  }

  // 5. Deterministic Engine Fallback
  return {
    reply: localReply(messages, catalog, orderInfo),
    source: "deterministic",
    model: "built-in-rules",
    latencyMs: Date.now() - t0,
  };
}

/* ================= INSIGHTS ================= */
function localInsights(stats: StoreStats): Insight[] {
  const half = Math.floor(stats.daily.length / 2);
  const first = stats.daily.slice(0, half).reduce((s, d) => s + d.revenue, 0);
  const second = stats.daily.slice(half).reduce((s, d) => s + d.revenue, 0);
  const growth = first > 0 ? ((second - first) / first) * 100 : 0;
  const topShare = stats.topProducts.length
    ? (stats.topProducts[0].revenue / Math.max(1, stats.topProducts.reduce((s, p) => s + p.revenue, 0))) * 100
    : 0;
  const blendedMargin = stats.revenue30d > 0 ? (stats.margin30d / stats.revenue30d) * 100 : 0;

  return [
    {
      tone: growth >= 0 ? "up" : "warn",
      title: growth >= 0 ? `Revenue pacing +${growth.toFixed(0)}% w/w` : `Revenue dipped ${growth.toFixed(0)}% w/w`,
      body: `Last 7 days collected $${second.toFixed(2)} vs $${first.toFixed(2)} the week before. ${growth >= 0 ? "Momentum favors scaling ad spend on the top two SKUs." : "Audit creative fatigue and re-check which supplier lanes are slowest this week."}`,
    },
    {
      tone: "gold",
      title: `Concentration risk at ${topShare.toFixed(0)}%`,
      body: stats.topProducts.length
        ? `${stats.topProducts[0].name} is driving ~${topShare.toFixed(0)}% of top-seller revenue. Keep two suppliers connected for that SKU and mirror the winning creative across Pets and Fitness.`
        : "Not enough order data yet — launch a low-ticket test bundle to calibrate.",
    },
    {
      tone: "info",
      title: `Blended margin ${blendedMargin.toFixed(1)}%`,
      body: blendedMargin >= 35 ? `Comfortably above the 15–25% cross-border band — the catalog mix is healthy. Consider a 5% price bump on the Pets line; review velocity is 4.9★ with room to absorb it.` : `Below the 35% comfort zone — shift weight toward domestic-lane SKUs (PawHaven, NimbusWeighted) where price tolerance is higher and ship-time complaints are near zero.`,
    },
    {
      tone: stats.pendingForward > 0 ? "warn" : "up",
      title: stats.pendingForward > 0 ? `${stats.pendingForward} order${stats.pendingForward === 1 ? "" : "s"} awaiting supplier forward` : "Fulfillment pipeline clear",
      body: stats.pendingForward > 0 ? "These generate supplier payout holds until routed — hit “Forward all pending” to clear them in under a second." : "All paid orders are already with suppliers. Average promise: under 7 days on domestic lanes — Feature that ETA in the PDP to lift conversion.",
    },
  ];
}

export async function aiInsights(stats: StoreStats): Promise<{ insights: Insight[]; source: AIProviderId }> {
  // Check if LM Studio is online for local insights
  const lm = await detectLMStudio();
  if (lm.isOnline && lm.models.length > 0) {
    const compact = JSON.stringify({
      revenue30d: stats.revenue30d,
      orders30d: stats.orders30d,
      aov: stats.aov,
      margin30d: stats.margin30d,
      pendingForward: stats.pendingForward,
      dailyRevenue: stats.daily.map((d) => d.revenue),
      topProducts: stats.topProducts.slice(0, 4),
      suppliers: stats.suppliers.slice(0, 6),
    });
    const raw = await callLMStudio(
      [{ role: "user", content: `Store snapshot: ${compact}\n\nReturn ONLY a JSON array of exactly 4 insights: [{"tone":"up|warn|gold|info","title":"<=9 words","body":"<=38 words, specific numbers, operator-grade advice for a dropshipping merchant"}]` }],
      "You are the chief-of-staff AI for a dropshipping store. Output raw JSON only, no prose, no markdown fences.",
      lm.models[0]?.id
    );
    if (raw) {
      try {
        const cleaned = raw.text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return { insights: parsed.slice(0, 4), source: "lmstudio" };
        }
      } catch { }
    }
  }

  // Fallback to local insights
  return { insights: localInsights(stats), source: "deterministic" };
}
