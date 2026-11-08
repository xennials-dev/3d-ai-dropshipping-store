import {
  SOURCED_CANDIDATES,
  MARKET_NICHES,
  type SourcedProductCandidate,
  type SourcingCategory,
} from "./sourcingData";

export type ScoutFilterCriteria = {
  category?: SourcingCategory | "All";
  minMargin?: number; // e.g. 0.6 for 60%
  maxWholesaleCost?: number;
  minContractLikelihood?: number; // e.g. 80
  supplierPlatform?: string;
  searchQuery?: string;
};

export type OpportunityScoreBreakdown = {
  profitScore: number; // 0 - 100
  shippingScore: number; // 0 - 100
  viralScore: number; // 0 - 100
  contractScore: number; // 0 - 100
  compositeScore: number; // 0 - 100
  estimatedDailyProfit20Units: number;
  verdictTone: "exceptional" | "strong" | "moderate" | "caution";
};

export function scoreOpportunity(candidate: SourcedProductCandidate): OpportunityScoreBreakdown {
  // 1. Profit Score: based on retail markup and gross profit margin
  const marginPct = (candidate.targetRetailPrice - candidate.wholesaleCost) / candidate.targetRetailPrice;
  const profitScore = Math.min(100, Math.round(marginPct * 125));

  // 2. Shipping Score: lighter weight and lower risk of shipping damage gets higher points
  let shippingScore = 100;
  if (candidate.shippingWeightGrams > 800) shippingScore -= 30;
  else if (candidate.shippingWeightGrams > 400) shippingScore -= 15;
  if (candidate.shippingWeightGrams <= 100) shippingScore = 98;

  // 3. Viral / Marketing Score (scaled 1-10 to 10-100)
  const viralScore = Math.round(candidate.viralScore * 10);

  // 4. Contract Likelihood Score from verified supplier attributes
  let contractScore = candidate.contractLikelihood;
  if (candidate.tradeAssurance) contractScore = Math.min(100, contractScore + 3);
  if (candidate.blindDropshipSupported) contractScore = Math.min(100, contractScore + 2);

  // Composite Weighted Multi-Criteria Decision Score:
  // 35% Profit + 25% Contract Likelihood + 20% Marketing Viral + 20% Shipping Logistics
  const compositeScore = Math.round(
    profitScore * 0.35 + contractScore * 0.25 + viralScore * 0.20 + shippingScore * 0.20
  );

  // Projected daily profit at modest 20 units/day sales volume:
  // Minus estimated average payment processing fee (2.9% + $0.30) and $4.50 courier airmail
  const estCourierCost = candidate.shippingWeightGrams < 300 ? 3.80 : 5.20;
  const netPerUnit = Math.max(
    0,
    candidate.targetRetailPrice -
      candidate.wholesaleCost -
      (candidate.targetRetailPrice * 0.029 + 0.3) -
      estCourierCost
  );
  const estimatedDailyProfit20Units = Math.round(netPerUnit * 20 * 100) / 100;

  let verdictTone: OpportunityScoreBreakdown["verdictTone"] = "moderate";
  if (compositeScore >= 88) verdictTone = "exceptional";
  else if (compositeScore >= 78) verdictTone = "strong";
  else if (compositeScore >= 65) verdictTone = "moderate";
  else verdictTone = "caution";

  return {
    profitScore,
    shippingScore,
    viralScore,
    contractScore,
    compositeScore,
    estimatedDailyProfit20Units,
    verdictTone,
  };
}

export function runAutonomousScout(criteria: ScoutFilterCriteria = {}): Array<{
  product: SourcedProductCandidate;
  metrics: OpportunityScoreBreakdown;
}> {
  return SOURCED_CANDIDATES.filter((item) => {
    if (criteria.category && criteria.category !== "All" && item.category !== criteria.category) {
      return false;
    }
    if (criteria.minMargin && item.suggestedMargin < criteria.minMargin) {
      return false;
    }
    if (criteria.maxWholesaleCost && item.wholesaleCost > criteria.maxWholesaleCost) {
      return false;
    }
    if (criteria.minContractLikelihood && item.contractLikelihood < criteria.minContractLikelihood) {
      return false;
    }
    if (criteria.supplierPlatform && criteria.supplierPlatform !== "All" && item.supplierPlatform !== criteria.supplierPlatform) {
      return false;
    }
    if (criteria.searchQuery) {
      const q = criteria.searchQuery.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  })
    .map((product) => ({
      product,
      metrics: scoreOpportunity(product),
    }))
    .sort((a, b) => b.metrics.compositeScore - a.metrics.compositeScore);
}

/* ========================================================================= */
/* ALIBABA VENDOR BIDDING & CONTRACT SCRIPT GENERATOR                        */
/* ========================================================================= */

export type ScriptNegotiationObjective =
  | "moq_waiver_dropship" // Negotiate MOQ=1 blind dropshipping agreement
  | "price_bidding_volume" // Bid lower target unit price based on projected volume
  | "custom_packaging_inserts" // Request custom branded box, flyers or tape
  | "strict_sla_quality" // Lock in 48-hour dispatch guarantee & refund policy
  | "sample_and_exclusive"; // Request sample order & territorial distribution terms

export type ScriptGeneratorParams = {
  product: SourcedProductCandidate;
  storeBrandName: string;
  proposedTargetPrice?: number;
  projectedMonthlyVolume?: number;
  objective: ScriptNegotiationObjective;
  includeChineseTranslation?: boolean;
};

export type GeneratedVendorScript = {
  title: string;
  objectiveDescription: string;
  subjectLine: string;
  englishScript: string;
  chineseScript: string;
  keyNegotiationTips: string[];
};

export function generateVendorBiddingScript(params: ScriptGeneratorParams): GeneratedVendorScript {
  const store = params.storeBrandName || "Vendora Retail";
  const pName = params.product.name;
  const supplier = params.product.supplierName;
  const currentCost = params.product.wholesaleCost.toFixed(2);
  const targetCost = params.proposedTargetPrice
    ? params.proposedTargetPrice.toFixed(2)
    : (params.product.wholesaleCost * 0.82).toFixed(2);
  const targetVol = params.projectedMonthlyVolume || 350;

  switch (params.objective) {
    case "moq_waiver_dropship":
      return {
        title: "Blind Dropshipping Contract & MOQ = 1 Waiver",
        objectiveDescription:
          "Persuades the manufacturer to fulfill single-unit orders with zero factory branding, blind packing slips, and CSV/API tracking feed.",
        subjectLine: `Long-Term Dropshipping Cooperation Inquiry — ${pName} (${store})`,
        englishScript: `Dear ${supplier} Sales Director / Export Team,

My name is Sourcing Director at ${store} (https://vendora.store). We are a fast-growing North American & European direct-to-consumer e-commerce brand specializing in ${params.product.category}.

We have vetted your factory production on Alibaba for "${pName}". We are launching a multi-channel paid ad campaign (TikTok Ads & Meta) targeting ${targetVol}+ monthly units.

Before scaling to bulk sea/air freight container orders, our protocol is to fulfill the initial orders via direct blind dropshipping for quality and customer satisfaction verification.

We would like to establish a formal dropshipping supplier agreement with your team under the following standard terms:
1. Blind Dropshipping: Neutral packaging with NO supplier price tags, NO Chinese flyers, and NO manufacturer marketing materials.
2. Order Processing: Dispatch within 24 to 48 hours via YunExpress, CNE, 4PX, or ePacket with valid tracking numbers.
3. Daily Batching: Daily order transmission via shared Google Sheet, CSV, or direct ERP/API integration.
4. Defective Rate: Immediate free reshipment or refund for any items arriving damaged with photo proof.
5. Packaging: Our branded invoice slip included inside each parcel (we will provide the printable PDF template).

We are ready to purchase a paid sample immediately to inspect finish quality and delivery speed. Please confirm:
- Your current best unit price for daily single-unit dropshipping orders.
- Estimated processing time to first carrier scan.
- Your preferred payment method (Alibaba Trade Assurance / Escrow).

Looking forward to building a long-term, high-volume partnership with your factory.

Warm regards,
Sourcing & Supply Chain Team
${store}`,
        chineseScript: `尊敬的 ${supplier} 销售总监 / 外贸部团队：

您好！我是 ${store} 品牌采购总监。我们是一家专注在欧美市场的高速发展DTC品牌，主营品类为 ${params.product.category}。

我们在阿里巴巴上认真评估了贵工厂生产的 "${pName}"，产品工艺与品质非常符合我们品牌的定位。我们即将为该单品启动北美及欧洲的 TikTok 和 Meta 付费投放计划，预计月销量在 ${targetVol} 件以上。

在正式批量订货（整箱或集装箱采购）之前，我们希望通过“一件代发 / 代发协议”的方式建立合作，快速验证当地客户的满意度。我们希望与贵工厂确认以下代发合作条款：

1. 纯中性盲发：包裹内外绝不放任何工厂信息、中文宣传单或价格标签。
2. 时效承诺：订单确认后24-48小时内出单号并交运（优先推荐云途YunExpress、4PX或专线）。
3. 批量对账：支持每日通过共享表格（Excel/CSV）或ERP对接打单，方便双方高效对账。
4. 售后与质检：出库前做好基础外观质检；若有运输损坏提供凭证后由贵厂免费补发或退款。
5. 定制面单：包裹内附带我们品牌的装箱清单（PDF由我方提供）。

我们今天就可以先拍下样品，测试做工细节与物流时效。请回复：
- 单件代发的底价（含基础包装）。
- 日常打单发货的处理时间（从付款到有上网轨迹需多久）。
- 是否支持通过阿里巴巴“信保订单”（Trade Assurance）支付结算。

期待与贵厂建立长期双赢的稳定合作！

顺祝商祺，
${store} 采购与供应链团队`,
        keyNegotiationTips: [
          "Always mention your paid ad spend or marketing budget so the supplier takes your single-unit request seriously as a precursor to bulk orders.",
          "Request Alibaba Trade Assurance on your first 50 orders so your payments are 100% escrow-protected.",
          "Ask for their representative's WeChat or WhatsApp for 10x faster response during Shenzhen/Yiwu working hours (UTC+8).",
        ],
      };

    case "price_bidding_volume":
      return {
        title: "Tiered Volume Price Bidding Contract",
        objectiveDescription:
          `Bids to reduce current wholesale cost from $${currentCost} down to $${targetCost} based on scaled order tiers.`,
        subjectLine: `Target Price Quotation & Tiered Contract Proposal — ${pName}`,
        englishScript: `Dear ${supplier} Team,

Thank you for your initial quote of $${currentCost} per unit on "${pName}".

We have completed our landing page pre-testing and margin modeling for ${store}. Our media buying budget is configured to push ${targetVol} to 600 units per month. However, after accounting for international courier airmail ($4.50) and merchant processing fees, our unit cost ceiling for healthy scale is $${targetCost}.

We would like to propose a tiered volume contract structure:
• Tier 1 (Initial 1–100 units): $${currentCost} (testing & calibration)
• Tier 2 (101–500 units/mo): $${targetCost} (active scaling tier)
• Tier 3 (500+ units/mo): $${(Number(targetCost) * 0.94).toFixed(2)} + custom embossed brand logo

If you can approve the Tier 2 unit price of $${targetCost} starting at 100 aggregated units, we will lock your factory in as our exclusive dropshipping supplier for this SKU across all our marketing channels.

Please let us know if your production manager can approve this tiered schedule so we can proceed with sample ordering today.

Best regards,
${store}`,
        chineseScript: `尊敬的 ${supplier} 团队：

感谢您之前对 "${pName}" 报出的单价 $${currentCost}。

我们在 ${store} 已经完成了前期的测品与数据分析，目前已经准备好预算将该单品放大至每月 ${targetVol} 至 600 件的销售规模。但考虑到国际专线空运费及海外支付通道成本，为了保证长期稳定的广告消耗与持续下单，我们核算的目标采购单价为 $${targetCost}。

我们提议建立阶梯采购合同模式：
• 第一阶段（测试期 1-100 件）：按原单价 $${currentCost} 结算。
• 第二阶段（月销达 101-500 件）：单价调整为 $${targetCost}。
• 第三阶段（月销超 500 件）：单价调整为 $${(Number(targetCost) * 0.94).toFixed(2)}，并商讨加印我方品牌Logo。

如果您能同意在累计订单达标后按 $${targetCost} 结算，我们愿将贵厂设为该产品在欧美区域的独家代发合作伙伴。期待您的回复！

${store} 采购部`,
        keyNegotiationTips: [
          "Never demand an immediate rock-bottom price on order #1; offering a tiered ladder shows you understand factory margins and builds trust.",
          "Show commitment: offer to pay immediately via Trade Assurance once the tier structure is confirmed in writing.",
        ],
      };

    case "custom_packaging_inserts":
      return {
        title: "White-Label Packaging & Custom Inserts Agreement",
        objectiveDescription:
          "Establishes a private label packaging contract: custom branded polybags, thank-you cards, or gift boxes.",
        subjectLine: `Custom Packaging & Private Label Dropshipping Inquiry — ${pName}`,
        englishScript: `Dear ${supplier} Team,

We are standardizing our customer unboxing experience for ${store} across our ${params.product.category} line.

For "${pName}", we would like to negotiate adding private label packaging to our fulfillment flow:
1. Branded Thank-You Card: 10×15cm full-color card (we print 2,000 cards in advance and store them at your factory for $0.05/ea).
2. Custom Zipper Polybag / Box: With our ${store} vector logo printed in single-color gold/white.
3. Inventory Storage: You hold our printed boxes/bags in your warehouse and pick 1 per daily dropship order.

Please quote:
- Minimum order quantity (MOQ) for custom printed packaging (polybag vs cardboard box).
- One-time plate mold fee (if applicable).
- Storage and labor fee per parcel to insert our card into the box.

We are ready to submit our vector logo files (.AI / .SVG) right away.

Thank you,
${store}`,
        chineseScript: `尊敬的 ${supplier} 团队：

为了提升 ${store} 品牌客户的开箱体验，我们希望在 "${pName}" 的代发流程中加入定制化包装：

1. 售后感谢卡：10×15cm 双面彩色卡片（我方可一次性批量印制2,000张存放在贵司仓库，发货时放入）。
2. 定制拉链袋/外盒：印制 ${store} 单色Logo。
3. 仓储与代打包：由贵厂协助寄存包材，每单发货时打包入袋。

请协助评估并报价：
- 定制包装袋/外盒的起订量（MOQ）及单价。
- 一次性印刷制版费。
- 每次代放卡片/代贴标的人工杂费（如有）。

我们已备好高清矢量源文件（AI/SVG格式），随时可以提供打样。期待您的专业建议！

${store} 品牌部`,
        keyNegotiationTips: [
          "Offer to pay for the packaging stock upfront (e.g. $100 for 1,000 polybags) so the factory has zero inventory risk on your custom packaging.",
          "A custom thank-you card with a 15% discount code drives 22%+ repeat purchases with zero ad cost.",
        ],
      };

    case "strict_sla_quality":
      return {
        title: "Strict 48-Hour Dispatch SLA & Quality Control Agreement",
        objectiveDescription:
          "Enforces dispatch time guarantees to prevent chargebacks and customer complaints on Stripe.",
        subjectLine: `Fulfillment SLA & Quality Control Contract Terms — ${pName}`,
        englishScript: `Dear ${supplier} Management,

Payment processors (Stripe & PayPal) and customer trust require strict delivery performance for our store (${store}).

We require your formal agreement on our Vendor Service Level Agreement (SLA) before scaling orders for "${pName}":
1. Dispatch Time Guarantee: Every order submitted before 2:00 PM China Time must receive an active carrier tracking scan within 48 business hours.
2. Defect Inspection: 100% visual inspection before packing (check zipper, seam, electrical charging port).
3. Damage / Lost Parcel Policy: If tracking shows lost in transit or customer receives a damaged unit, supplier provides immediate free replacement on the next day's dispatch.
4. Advance Notice on Stock: Supplier must give 5 business days advance notice if raw materials or inventory drop below 100 units.

Please confirm that your fulfillment team accepts these standard terms. We take supplier relationships seriously and ensure prompt escrow payments for reliable partners.

Best regards,
${store} Operations`,
        chineseScript: `尊敬的 ${supplier} 管理团队：

鉴于海外支付通道（Stripe 及信用卡组织）对时效有极高合规要求，为保障双方长期合作顺畅，针对 "${pName}" 我们希望与贵司约定以下发货服务协议（SLA）：

1. 发货与上网时效：工作日当天下午2点前下的订单，须在48小时内产生真实物流揽收/上网轨迹。
2. 出库品控：发货前进行基础外观与功能质检（检查拉链、接缝、插头或主要零配件）。
3. 破损与丢件处理：若运输途中丢件或买家收货破损并附照片，贵厂在次日发货中予以免费补发。
4. 库存预警：若工厂原料或现货库存低于100件，请提前5个工作日告知，以便我方调整前端广告预算。

请确认贵司能否支持以上标准发货协议。我们重视契约精神，按时结款，愿与优质诚信工厂长期携手！

${store} 运营部`,
        keyNegotiationTips: [
          "Stripe monitors shipping time and tracking upload velocity; having a 48h dispatch SLA protects your Stripe account from dispute penalties.",
          "Keep all agreement logs within Alibaba Messenger so Trade Assurance arbitrators will side with you in any dispute.",
        ],
      };

    case "sample_and_exclusive":
      return {
        title: "Paid Sample Order & Regional Exclusivity Inquiry",
        objectiveDescription:
          "Orders physical inspection samples while inquiring about non-compete distribution terms for your marketing angles.",
        subjectLine: `Sample Order Request & Market Exclusivity Discussion — ${pName}`,
        englishScript: `Dear ${supplier} Team,

We are finalizing our Q3/Q4 product line at ${store} and have shortlisted your "${pName}" as our primary hero SKU.

We would like to place an immediate paid sample order to our US/European evaluation address:
- Shipping courier: Fast air express (DHL / FedEx / YunExpress Priority).
- Purpose: High-resolution studio photography, 3D render mapping, and durability stress tests.

Additionally, as we invest significant capital into creative production and viral ad spend, does your factory offer regional exclusivity or a first-right-of-refusal for online direct-to-consumer sales in the US/UK market once we exceed 1,000 monthly units?

Please send the Alibaba Trade Assurance link for 2 sample units right away.

Thank you,
${store}`,
        chineseScript: `尊敬的 ${supplier} 团队：

我们正在敲定下半年的主推产品线，"${pName}" 已入选我们 ${store} 的重点推广清单。

我们希望立即向贵司拍下2件付费打样，寄往我方海外评测地址进行高清产品拍摄、3D渲染建模以及耐用性测试。请提供最快空运专线（DHL/云途特快）的含运费样品信保链接。

另外，鉴于我司将投入较大广告与视频拍摄成本，若我们月采购量稳定突破1,000件以上，贵司是否能给予北美/欧洲区域线上DTC渠道的优先供货或防跟卖保护？

期待收到您的样品链接与回复！

${store} 产品中心`,
        keyNegotiationTips: [
          "Always order 2 samples: 1 to stress test (drop, spill, wash) and 1 to keep pristine for high-res photography and video recording.",
          "Paying for samples immediately shows suppliers you are a serious commercial buyer, not a tire-kicker.",
        ],
      };
  }
}
