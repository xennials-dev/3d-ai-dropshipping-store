"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  Sparkles,
  TrendingUp,
  Percent,
  DollarSign,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Send,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Award,
  Truck,
  Building2,
  FileText,
  BadgeCheck,
  Sliders,
  ChevronRight,
  Globe,
  Store,
  ChevronDown,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  MARKET_NICHES,
  SOURCED_CANDIDATES,
  type SourcedProductCandidate,
  type SourcingCategory,
  type MarketNicheStats,
} from "@/lib/sourcingData";
import {
  runAutonomousScout,
  generateVendorBiddingScript,
  type OpportunityScoreBreakdown,
  type ScriptNegotiationObjective,
  type GeneratedVendorScript,
} from "@/lib/opportunityEngine";

type TabKey = "radar" | "scripts" | "niches" | "algorithm";

const CATEGORIES: Array<SourcingCategory | "All"> = [
  "All",
  "Kitchen & Dining",
  "Home Décor",
  "Tools & Home Improvement",
  "Apparel & Footwear",
  "Beauty & Personal Care",
  "Baby Products",
  "Pet Supplies",
  "Office Products",
  "Phone Accessories",
  "Car Accessories",
];

const OBJECTIVES: Array<{ id: ScriptNegotiationObjective; label: string; desc: string }> = [
  {
    id: "moq_waiver_dropship",
    label: "MOQ=1 Blind Dropshipping Agreement",
    desc: "Waive factory 500-unit minimum and ship unbranded customer orders during ad testing",
  },
  {
    id: "price_bidding_volume",
    label: "Tiered Volume Price Bidding",
    desc: "Target 15-25% lower wholesale cost by presenting projected monthly sales volume",
  },
  {
    id: "custom_packaging_inserts",
    label: "Branded Packaging & Custom Inserts",
    desc: "Negotiate custom unboxing, thank-you cards, and logo polymailers for brand loyalty",
  },
  {
    id: "strict_sla_quality",
    label: "Strict 48-Hour Dispatch SLA & Quality Guarantee",
    desc: "Lock in strict fulfillment speed and automated replacements for defective items",
  },
  {
    id: "sample_and_exclusive",
    label: "Paid Sample & Regional Exclusivity",
    desc: "Order fast air express sample and explore exclusivity for US/EU TikTok/Meta traffic",
  },
];

export default function AdminSourcingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("radar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SourcingCategory | "All">("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [minMargin, setMinMargin] = useState<number>(0);
  const [minContractLikelihood, setMinContractLikelihood] = useState<number>(70);
  const [sortBy, setSortBy] = useState<"composite" | "margin" | "profit" | "contract">("composite");
  const [isScanning, setIsScanning] = useState(false);

  // Script Generator State
  const [scriptProduct, setScriptProduct] = useState<SourcedProductCandidate>(SOURCED_CANDIDATES[0]);
  const [storeBrandName, setStoreBrandName] = useState("NovaDrop Studio");
  const [proposedPrice, setProposedPrice] = useState<number>(SOURCED_CANDIDATES[0].wholesaleCost);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(600);
  const [negotiationObjective, setNegotiationObjective] =
    useState<ScriptNegotiationObjective>("moq_waiver_dropship");
  const [copiedEnglish, setCopiedEnglish] = useState(false);
  const [copiedChinese, setCopiedChinese] = useState(false);

  // Storefront Import State
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<Record<string, "imported" | "exists" | "error">>({});

  // Trigger simulated autonomous scan
  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 650);
  };

  // Run opportunity scout
  const scoutResults = useMemo(() => {
    let results = runAutonomousScout({
      category: selectedCategory,
      minMargin: minMargin > 0 ? minMargin / 100 : undefined,
      minContractLikelihood,
      supplierPlatform: selectedPlatform,
      searchQuery: searchQuery.trim() || undefined,
    });

    if (sortBy === "margin") {
      results = [...results].sort((a, b) => b.product.suggestedMargin - a.product.suggestedMargin);
    } else if (sortBy === "profit") {
      results = [...results].sort(
        (a, b) => b.metrics.estimatedDailyProfit20Units - a.metrics.estimatedDailyProfit20Units
      );
    } else if (sortBy === "contract") {
      results = [...results].sort((a, b) => b.product.contractLikelihood - a.product.contractLikelihood);
    }

    return results;
  }, [selectedCategory, minMargin, minContractLikelihood, selectedPlatform, searchQuery, sortBy]);

  // Generate Vendor Script
  const generatedScript: GeneratedVendorScript = useMemo(() => {
    return generateVendorBiddingScript({
      product: scriptProduct,
      storeBrandName,
      proposedTargetPrice: proposedPrice,
      projectedMonthlyVolume: monthlyVolume,
      objective: negotiationObjective,
      includeChineseTranslation: true,
    });
  }, [scriptProduct, storeBrandName, proposedPrice, monthlyVolume, negotiationObjective]);

  // 1-Click Import candidate to live storefront
  const handleImportToStore = async (candidate: SourcedProductCandidate) => {
    setImportingId(candidate.id);
    try {
      const res = await fetch("/api/sourcing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate }),
      });
      const data = await res.json();
      if (data.success) {
        setImportStatus((prev) => ({
          ...prev,
          [candidate.id]: data.alreadyExists ? "exists" : "imported",
        }));
      } else {
        setImportStatus((prev) => ({ ...prev, [candidate.id]: "error" }));
      }
    } catch (err) {
      console.error(err);
      setImportStatus((prev) => ({ ...prev, [candidate.id]: "error" }));
    } finally {
      setImportingId(null);
    }
  };

  const handleCopy = (text: string, type: "en" | "zh") => {
    navigator.clipboard.writeText(text);
    if (type === "en") {
      setCopiedEnglish(true);
      setTimeout(() => setCopiedEnglish(false), 2000);
    } else {
      setCopiedChinese(true);
      setTimeout(() => setCopiedChinese(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e8edf5] font-sans antialiased pb-24">
      {/* Top Banner & Header */}
      <div className="border-b border-white/8 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Autonomous Sourcing Radar
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Alibaba AI Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Proactive Dropshipping Market Intelligence &middot; 2026&ndash;2033 Forecast ($167B &rarr; $562B @ 18.9% CAGR)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-blue-400" : ""}`} />
              {isScanning ? "Proactively Scanning..." : "Rescan Market"}
            </button>
            <Link
              href="/admin"
              className="px-3 py-2 text-xs font-medium rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
            >
              Store Dashboard
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:brightness-110 transition-all"
            >
              <Store className="h-3.5 w-3.5" />
              Live Store
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-white/5 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === "radar"
                ? "border-blue-500 text-blue-400 bg-blue-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="h-4 w-4" />
            Product Radar & Candidates ({scoutResults.length})
          </button>
          <button
            onClick={() => setActiveTab("scripts")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === "scripts"
                ? "border-purple-500 text-purple-400 bg-purple-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Alibaba Negotiation Studio
          </button>
          <button
            onClick={() => setActiveTab("niches")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === "niches"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            10 Niche Growth Profiles
          </button>
          <button
            onClick={() => setActiveTab("algorithm")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === "algorithm"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Contract Scoring Matrix
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: PRODUCT RADAR & CANDIDATES */}
        {activeTab === "radar" && (
          <div className="space-y-6">
            {/* Top Market Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#0f1422] border border-white/8 relative overflow-hidden">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Global Dropship Market
                </div>
                <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
                  $167B <span className="text-xs text-emerald-400 font-medium">+18.9% CAGR</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Expanding toward $562B by 2033</div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              </div>

              <div className="p-4 rounded-xl bg-[#0f1422] border border-white/8 relative overflow-hidden">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Average Retail Margin
                </div>
                <div className="text-2xl font-bold text-emerald-400 flex items-baseline gap-1.5">
                  68.4%
                </div>
                <div className="text-xs text-slate-500 mt-1">Target range: 60% &ndash; 76% gross</div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              </div>

              <div className="p-4 rounded-xl bg-[#0f1422] border border-white/8 relative overflow-hidden">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Alibaba Direct Factories
                </div>
                <div className="text-2xl font-bold text-purple-400 flex items-baseline gap-1.5">
                  100% Verified
                </div>
                <div className="text-xs text-slate-500 mt-1">Trade Assurance &amp; Blind Dropship</div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
              </div>

              <div className="p-4 rounded-xl bg-[#0f1422] border border-white/8 relative overflow-hidden">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Est. 20-Unit Daily Profit
                </div>
                <div className="text-2xl font-bold text-amber-400 flex items-baseline gap-1.5">
                  $540 &ndash; $890
                </div>
                <div className="text-xs text-slate-500 mt-1">Per winning product at modest ad scale</div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="p-4 rounded-xl bg-[#0f1422] border border-white/8 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search high-demand products (e.g., athleisure, pimple patch, bento box, wooden toys, snuffle mat)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#0b0e17] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="px-3 py-2 text-xs bg-[#0b0e17] border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Platforms</option>
                    <option value="Alibaba">Alibaba Direct</option>
                    <option value="AliExpress">AliExpress Verified</option>
                    <option value="Shopify Collective">Shopify Collective</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "composite" | "margin" | "profit" | "contract")
                    }
                    className="px-3 py-2 text-xs bg-[#0b0e17] border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="composite">Sort by: Composite Score</option>
                    <option value="profit">Sort by: Daily Profit (20u)</option>
                    <option value="margin">Sort by: Profit Margin</option>
                    <option value="contract">Sort by: Contract Likelihood</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scoutResults.map(({ product, metrics }) => {
                const isImported = importStatus[product.id] === "imported";
                const alreadyExists = importStatus[product.id] === "exists";
                const isImporting = importingId === product.id;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col rounded-2xl bg-[#0f1422] border border-white/8 hover:border-blue-500/40 transition-all overflow-hidden group shadow-lg"
                  >
                    {/* Card Media & Badges */}
                    <div className="relative h-48 w-full bg-[#171d2e] overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-transparent to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-black/70 text-amber-300 backdrop-blur-md border border-amber-400/30">
                          {product.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-blue-950/80 text-blue-300 backdrop-blur-md border border-blue-400/30">
                          {product.supplierPlatform}
                        </span>
                      </div>

                      {/* Composite Score Circle */}
                      <div className="absolute top-3 right-3 flex flex-col items-end">
                        <div className="h-10 w-10 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-md">
                          <span className="text-xs font-black text-emerald-400">
                            {metrics.compositeScore}
                          </span>
                          <span className="text-[8px] uppercase tracking-tighter text-slate-400 -mt-0.5">
                            SCORE
                          </span>
                        </div>
                      </div>

                      {/* Bottom Info in Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[200px]">
                          {product.supplierName} ({product.supplierCountry})
                        </span>
                        {product.tradeAssurance && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            <ShieldCheck className="h-3 w-3" /> Trade Assurance
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {product.tagline}
                        </p>
                      </div>

                      {/* Financials & Margins Box */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#090c14] border border-white/5 text-center">
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">Wholesale</div>
                          <div className="text-xs font-bold text-slate-200 mt-0.5">
                            ${product.wholesaleCost.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-semibold">Target Retail</div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            ${product.targetRetailPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-emerald-400 font-semibold">Margin</div>
                          <div className="text-xs font-bold text-emerald-400 mt-0.5">
                            {Math.round(product.suggestedMargin * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Contract Feasibility Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Building2 className="h-3.5 w-3.5 text-blue-400" />
                            Dropship Contract Likelihood:
                          </span>
                          <span className="font-bold text-emerald-400 text-xs">
                            {product.contractLikelihood}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                            style={{ width: `${product.contractLikelihood}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          {product.contractVerdict}
                        </p>
                      </div>

                      {/* TikTok UGC Viral Hook */}
                      <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-xs">
                        <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px] mb-0.5">
                          <Flame className="h-3.5 w-3.5 text-amber-400" />
                          Viral TikTok / Reels Hook ({product.viralScore}/10):
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          &ldquo;{product.recommendedHook}&rdquo;
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setScriptProduct(product);
                              setProposedPrice(product.wholesaleCost);
                              setActiveTab("scripts");
                            }}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Bidding Script
                          </button>

                          <a
                            href={product.alibabaSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Alibaba Vendor
                          </a>
                        </div>

                        <button
                          onClick={() => handleImportToStore(product)}
                          disabled={isImporting || isImported || alreadyExists}
                          className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isImported || alreadyExists
                              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-blue-500/20"
                          }`}
                        >
                          {isImporting ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Adding to Storefront...
                            </>
                          ) : isImported ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              Imported to Live Store
                            </>
                          ) : alreadyExists ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              Already Active in Store
                            </>
                          ) : (
                            <>
                              <Store className="h-3.5 w-3.5" />
                              1-Click Import to Live Storefront
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ALIBABA NEGOTIATION & SCRIPT STUDIO */}
        {activeTab === "scripts" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f1422] border border-white/8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-400" />
                  Alibaba Vendor Negotiation &amp; Bidding Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Generate high-conversion, bilingual English and Chinese (中文) supplier outreach messages. 
                  Designed to overcome the &ldquo;MOQ=500&rdquo; factory barrier and secure single-unit blind dropshipping contracts.
                </p>
              </div>

              {/* Configuration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090c14] border border-white/5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Product Candidate
                  </label>
                  <select
                    value={scriptProduct.id}
                    onChange={(e) => {
                      const found = SOURCED_CANDIDATES.find((c) => c.id === e.target.value);
                      if (found) {
                        setScriptProduct(found);
                        setProposedPrice(found.wholesaleCost);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-[#0f1422] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {SOURCED_CANDIDATES.map((cand) => (
                      <option key={cand.id} value={cand.id}>
                        [{cand.category}] {cand.name} (${cand.wholesaleCost})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={storeBrandName}
                    onChange={(e) => setStoreBrandName(e.target.value)}
                    placeholder="e.g. NovaDrop Direct"
                    className="w-full px-3 py-2 text-xs bg-[#0f1422] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Bidding Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-[#0f1422] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Negotiation Objective Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Negotiation Objective:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {OBJECTIVES.map((obj) => (
                    <div
                      key={obj.id}
                      onClick={() => setNegotiationObjective(obj.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        negotiationObjective === obj.id
                          ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10"
                          : "bg-[#090c14] border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        {obj.label}
                        {negotiationObjective === obj.id && (
                          <Check className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {obj.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Tips Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-500/20 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-blue-300">
                    Solopreneur Alibaba Sourcing Secret:
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Factories ignore requests asking &ldquo;Can you dropship 1 piece?&rdquo;. Instead, frame it as: 
                    <strong className="text-white"> &ldquo;We are launching a $500/day Meta &amp; TikTok ad campaign. We need blind dropship fulfillment during the initial 3-week verification window before locking our 1,000-unit bulk production contract.&rdquo;</strong>
                    Sending the Chinese translation yields a 3x higher response rate and prioritized supplier dispatch.
                  </p>
                </div>
              </div>

              {/* Generated Scripts Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* English Script */}
                <div className="p-4 rounded-xl bg-[#090c14] border border-white/8 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">English Outreach Script</span>
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          Professional Buyer
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(generatedScript.englishScript, "en")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                      >
                        {copiedEnglish ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedEnglish ? "Copied!" : "Copy English"}
                      </button>
                    </div>

                    <div className="mt-3 p-3 rounded-lg bg-[#07090e] border border-white/5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {generatedScript.englishScript}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Includes 48-hr SLA terms &amp; blind pack requirement</span>
                    <a
                      href={scriptProduct.alibabaSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Paste into Alibaba Chat <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Chinese Script */}
                <div className="p-4 rounded-xl bg-[#090c14] border border-white/8 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Chinese (中文) Supplier Script</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          3x Response Rate
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(generatedScript.chineseScript, "zh")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        {copiedChinese ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedChinese ? "已复制 (Copied!)" : "Copy 中文 (Chinese)"}
                      </button>
                    </div>

                    <div className="mt-3 p-3 rounded-lg bg-[#07090e] border border-white/5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {generatedScript.chineseScript}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Native cross-border phrasing (一件代发 / 中性包装 / 48小时发货)</span>
                    <a
                      href={scriptProduct.alibabaSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Open Factory Page <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 10 NICHE GROWTH PROFILES */}
        {activeTab === "niches" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-400" />
                  Top 10 High-Growth Dropshipping Niches (2026&ndash;2035)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized from global retail data, Google Trends spikes, and TikTok viral traction.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MARKET_NICHES.map((niche) => (
                <div
                  key={niche.name}
                  className="p-5 rounded-2xl bg-[#0f1422] border border-white/8 space-y-4 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{niche.name}</h3>
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                        {niche.marketSize} &middot; {niche.cagrOrSpike}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      High Growth
                    </span>
                  </div>

                  {/* Projected Growth Highlight */}
                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs">
                    <div className="text-blue-400 font-bold mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Long-Term Projection:
                    </div>
                    <p className="text-slate-300 leading-relaxed">{niche.projectedGrowth}</p>
                  </div>

                  {/* Growth Driver */}
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Primary Growth Driver:
                    </div>
                    <p className="text-slate-300 leading-relaxed">{niche.growthDriver}</p>
                  </div>

                  {/* Trend Snippet Note */}
                  <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-xs text-slate-400">
                    <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{niche.trendSnippet}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTRACT SCORING MATRIX */}
        {activeTab === "algorithm" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f1422] border border-white/8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Autonomous Sourcing &amp; Contract Scoring Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  How our autonomous engine proactively ranks suppliers, evaluates dropshipping contract likelihood, and eliminates bad factories before you invest ad spend.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#090c14] border border-white/5 space-y-2">
                  <div className="text-emerald-400 font-bold text-2xl">35%</div>
                  <div className="text-sm font-bold text-white">Profit &amp; Gross Margin</div>
                  <p className="text-xs text-slate-400">
                    Evaluates retail markup multiplier against wholesale factory cost. Requires minimum 60% gross margin to absorb ad CAC.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090c14] border border-white/5 space-y-2">
                  <div className="text-blue-400 font-bold text-2xl">30%</div>
                  <div className="text-sm font-bold text-white">Contract Feasibility</div>
                  <p className="text-xs text-slate-400">
                    Assesses Alibaba Trade Assurance, willingness to waive MOQ, blind packaging support, and English/Chinese communication responsiveness.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090c14] border border-white/5 space-y-2">
                  <div className="text-purple-400 font-bold text-2xl">20%</div>
                  <div className="text-sm font-bold text-white">Shipping &amp; Transit SLA</div>
                  <p className="text-xs text-slate-400">
                    Favors low package weight (&lt;400g) and ePacket/YunExpress lines under 10 days to minimize customer dispute and chargeback rates.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090c14] border border-white/5 space-y-2">
                  <div className="text-amber-400 font-bold text-2xl">15%</div>
                  <div className="text-sm font-bold text-white">Viral TikTok / IG Hook</div>
                  <p className="text-xs text-slate-400">
                    Scored on visual demonstration &ldquo;scroll-stopper&rdquo; power. Problem-solving and satisfying transformation products rank highest.
                  </p>
                </div>
              </div>

              {/* Solopreneur Checklist */}
              <div className="p-5 rounded-xl bg-[#090c14] border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Automated Pre-Contract Vetting Checklist for Alibaba
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Blind Packaging Guarantee:</strong> No Chinese price tags, invoices, or factory flyers inside customer parcel.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>48-Hour Dispatch SLA:</strong> Orders placed before 3 PM UTC dispatched with valid YunExpress/4PX tracking within 48h.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Defective Replacement Policy:</strong> Supplier auto-credits or re-ships any damaged items upon photo/video proof.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Alibaba Trade Assurance:</strong> Payments run strictly through Alibaba escrow until initial volume milestone is fulfilled.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
