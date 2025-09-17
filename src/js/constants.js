// constants.js - 棒球選手能力與數據轉換
// 說明：本檔案定義了打者與投手的能力值（Attr）與實際數據（Stat）之間的轉換邏輯。

console.log('載入棒球常數與工具函式...');

// ====================================
// ⚾️ 打者屬性與數據對應表
// ====================================

// EYE屬性與保送率（BB）對應表
const EYE_BB_RATE_TABLE = [
  [1, 0.001],      // 最低EYE: 0.1% BB率
  [20, 0.025],    // 業餘等級: 2.5% BB率
  [40, 0.05],     // pr1: 5% BB率
  [70, 0.087],    // pr50: 8.7% BB率
  [100, 0.170],   // pr99: 17% BB率
  [120, 0.20],    // 明星等級: 20% BB率
  [150, 0.270],   // 頂級等級: 27% BB率
  [300, 0.450],   // 傳奇等級: 45% BB率
  [500, 0.800]    // 神等級: 80% BB率
];

// EYE屬性對於擊中球後安打的額外加成
const EYE_CONTACT_BONUS_TABLE = [
  [1, 0.000],      // 最低EYE: 無加成
  [20, 0.005],    // 業餘等級: +0.5% 安打機率
  [40, 0.010],    // pr1: +1% 安打機率
  [70, 0.018],    // pr50: +1.8% 安打機率
  [100, 0.030],   // pr99: +3% 安打機率（用於計算BA）
  [120, 0.035],   // 明星等級: +3.5% 安打機率
  [150, 0.040],   // 頂級等級: +4% 安打機率
  [300, 0.060],   // 傳奇等級: +6% 安打機率
  [500, 0.080]    // 神等級: +8% 安打機率
];

// HIT屬性與擊中球率（Contact Rate）對應表
const HIT_CONTACT_RATE_TABLE = [
  [1, 0.05],      // 最低HIT: 5% 擊中球率
  [20, 0.4],      // 業餘等級: 40% 擊中球率
  [40, 0.53],     // pr1: 53% 擊中球率
  [70, 0.59],     // pr50: 59% 擊中球率
  [100, 0.62],    // pr99: 62% 擊中球率
  [120, 0.65],    // 明星等級: 65% 擊中球率
  [150, 0.66],    // 頂級等級: 66% 擊中球率
  [300, 0.85],    // 傳奇等級: 85% 擊中球率
  [500, 0.9]      // 神等級: 90% 擊中球率
];

// HIT屬性與安打成功率對應表
const HIT_SUCCESS_RATE_TABLE = [
  [1, 0.05],      // 最低HIT: 安打成功率 5%
  [20, 0.25],     // 業餘等級: 安打成功率 25%
  [40, 0.42],     // pr1: 安打成功率 42%
  [70, 0.48],     // pr50: 安打成功率 48%
  [100, 0.52],    // pr99: 安打成功率 52%
  [120, 0.55],    // 明星等級: 安打成功率 55%
  [150, 0.58],    // 頂級等級: 安打成功率 58%
  [300, 0.80],    // 傳奇等級: 安打成功率 80%
  [500, 0.95]     // 神等級: 安打成功率 95%
];

// POW屬性與長打率（XBH）對應表
const POW_XBH_RATE_TABLE = [
  [1, 0.02],      // 最低POW: 長打率 2%
  [20, 0.10],     // 業餘等級: 長打率 10%
  [40, 0.18],     // pr1: 長打率 18%
  [70, 0.25],     // pr50: 長打率 25%
  [100, 0.35],    // pr99: 長打率 35%
  [120, 0.42],    // 明星等級: 長打率 42%
  [150, 0.50],    // 頂級等級: 長打率 50%
  [300, 0.75],    // 傳奇等級: 長打率 75%
  [500, 0.95]     // 神等級: 長打率 95%
];

// POW屬性與長打中形成全壘打的比例（HR Ratio）
const POW_HR_RATIO_TABLE = [
  [1, 0.01],      // 最低POW: 長打中 1% 是全壘打
  [20, 0.05],     // 業餘等級: 長打中 5% 是全壘打
  [40, 0.129],    // pr1: 長打中 12.9% 是全壘打
  [70, 0.42],     // pr50: 長打中 42% 是全壘打
  [100, 0.5],     // pr99: 長打中 50% 是全壘打
  [120, 0.55],    // 明星等級: 長打中 55% 是全壘打
  [150, 0.77],    // 頂級等級: 長打中 77% 是全壘打
  [300, 0.75],    // 傳奇等級: 長打中 75% 是全壘打
  [500, 0.99]     // 神等級: 長打中 99% 是全壘打
];

// ====================================
// 🛠️ 通用工具函式
// ====================================

// 根據錨點進行線性插值
function interpolate(value, anchors) {
  value = Math.max(1, Math.min(500, value));

  for (let i = 0; i < anchors.length - 1; i++) {
    const [x1, y1] = anchors[i];
    const [x2, y2] = anchors[i + 1];

    if (value >= x1 && value <= x2) {
      if (x2 === x1) return y1;
      return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
    }
  }

  return value <= anchors[0][0] ? anchors[0][1] : anchors[anchors.length - 1][1];
}

// ====================================
// 📦 模組匯出
// ====================================

// 常數已載入

// 匯出打者常數
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EYE_BB_RATE_TABLE,
    EYE_CONTACT_BONUS_TABLE,
    HIT_CONTACT_RATE_TABLE,
    HIT_SUCCESS_RATE_TABLE,
    POW_XBH_RATE_TABLE,
    POW_HR_RATIO_TABLE,
    interpolate
  };
}

// 瀏覽器全域變數
if (typeof window !== 'undefined') {
  window.EYE_BB_RATE_TABLE = EYE_BB_RATE_TABLE;
  window.EYE_CONTACT_BONUS_TABLE = EYE_CONTACT_BONUS_TABLE;
  window.HIT_CONTACT_RATE_TABLE = HIT_CONTACT_RATE_TABLE;
  window.HIT_SUCCESS_RATE_TABLE = HIT_SUCCESS_RATE_TABLE;
  window.POW_XBH_RATE_TABLE = POW_XBH_RATE_TABLE;
  window.POW_HR_RATIO_TABLE = POW_HR_RATIO_TABLE;
  window.interpolate = interpolate;

  // 匯出簡易物件
  window.SIMPLE_CONSTANTS = {
    EYE_BB_RATE_TABLE,
    EYE_CONTACT_BONUS_TABLE,
    HIT_CONTACT_RATE_TABLE,
    HIT_SUCCESS_RATE_TABLE,
    POW_XBH_RATE_TABLE,
    POW_HR_RATIO_TABLE,
    interpolate
  };

  // 預設模擬季數（供桌面端使用）。如外部已定義則不覆寫。
  if (typeof window.NUM_SIMULATIONS === 'undefined') {
    window.NUM_SIMULATIONS = 1000;
  }
}

// ====================================
// 🥎 追加：投手模型與通用工具（與打者相容）
// ====================================

// 反轉錨點：[stat, attr] -> [attr, stat]
function invertAnchors(statAttrAnchors) {
  const arr = statAttrAnchors.map(([stat, attr]) => [attr, stat]);
  arr.sort((a, b) => a[0] - b[0]);
  return arr;
}

// 從統計值推估能力值（表需為 [stat, attr]）
function reverseInterpolate(statValue, statAttrAnchors) {
  const minStat = statAttrAnchors[0][0];
  const maxStat = statAttrAnchors[statAttrAnchors.length - 1][0];
  const v = Math.max(minStat, Math.min(maxStat, statValue));
  for (let i = 0; i < statAttrAnchors.length - 1; i++) {
    const [s1, a1] = statAttrAnchors[i];
    const [s2, a2] = statAttrAnchors[i + 1];
    if ((s1 <= v && v <= s2) || (s1 >= v && v >= s2)) {
      if (s2 === s1) return a1;
      return a1 + (a2 - a1) * (v - s1) / (s2 - s1);
    }
  }
  if (v <= minStat) return statAttrAnchors[0][1];
  return statAttrAnchors[statAttrAnchors.length - 1][1];
}

// 2025 賽季聯盟平均（基於最新 MLB 數據，attr=70 ≈ pr50）
const LEAGUE_AVG = { BB: 0.086, K: 0.226, BA: 0.268, SLG: 0.442, OBP: 0.315 };

// 2025 賽季投手 wOBA 錨點（越低越好）
const PITCHER_WOBA_PERCENTILES = [
  [0.211, 99],   // pr1: 最佳 1% 投手
  [0.276, 90],   // pr10: 前 10% 優秀投手
  [0.301, 75],   // pr25: 前 25% 投手
  [0.325, 50],   // pr50: 聯盟平均水平
  [0.351, 25],   // pr75: 後 25% 投手
  [0.379, 10],   // pr90: 後 10% 投手
  [0.411, 1]     // pr99: 最差 1% 投手
];

// wOBA 百分位數轉換為 OVR 的映射表
const PITCHER_WOBA_TO_OVR = [
  [99, 120],     // 前 1% → 120 OVR (Cy Young 級別)
  [90, 100],     // 前 10% → 100 OVR (全明星級別)
  [75, 85],      // 前 25% → 85 OVR (優秀級別)
  [50, 70],      // 平均 → 70 OVR (聯盟平均)
  [25, 55],      // 後 25% → 55 OVR (替補級別)
  [10, 40],      // 後 10% → 40 OVR (邊緣級別)
  [1, 20]        // 最差 1% → 20 OVR (無法勝任級別)
];

// 投手常數表（stat -> attr，基於 2025 賽季 MLB 百分位數）
// 設計原則：attr 70 = pr50, attr 100 = pr99, attr 120+ = 世紀級, attr 40 = pr1
const PITCHER_CONTROL_TABLE = [
  // BB%: pr1=3.6%, pr10=5.6%, pr25=6.9%, pr50=8.6%, pr75=10.6%, pr90=11.6%, pr99=14.8%
  // 正確映射：attr 100 = pr99 (14.8%), attr 70 = pr50 (8.6%), attr 40 = pr1 (3.6%)
  [0.030, 150], [0.036, 120], [0.056, 100], [0.069, 85], [0.08, 70], [0.88, 55], [0.116, 40], [0.148, 20], [0.200, 1]
];
const PITCHER_STRIKEOUT_TABLE = [
  // K%: pr1=11.5%, pr10=16.4%, pr25=19.6%, pr50=22.6%, pr75=26.8%, pr90=29.3%, pr99=36.1%
  // 正確映射：attr 100 = pr99 (36.1%), attr 70 = pr50 (22.6%), attr 40 = pr1 (11.5%)
  [0.070, 1], [0.115, 20], [0.164, 40], [0.196, 55], [0.226, 70], [0.283, 85], [0.358, 100], [0.383, 120], [0.450, 150]
];
const PITCHER_STUFF_TABLE = [
  // BAA: pr1=.184, pr10=.216, pr25=.242, pr50=.268, pr75=.288, pr90=.302, pr99=.348
  // 正確映射：attr 100 = pr1 (.184), attr 70 = pr50 (.268), attr 40 = pr99 (.348)
  [0.140, 150], [0.17, 120], [0.2, 100], [0.232, 85], [0.268, 70], [0.288, 55], [0.302, 40], [0.338, 20], [0.400, 1]
];
const PITCHER_SUPPRESSION_TABLE = [
  // SLGA: pr1=.242, pr10=.343, pr25=.392, pr50=.442, pr75=.489, pr90=.519, pr99=.603
  // 正確映射：attr 100 = pr1 (.242), attr 70 = pr50 (.442), attr 40 = pr99 (.603)
  [0.200, 150], [0.242, 120], [0.343, 100], [0.392, 85], [0.442, 70], [0.489, 55], [0.519, 40], [0.603, 20], [0.800, 1]
];

// attr -> stat 錨點
const CONTROL_ATTR_TO_BB = invertAnchors(PITCHER_CONTROL_TABLE);
const STRIKEOUT_ATTR_TO_K = invertAnchors(PITCHER_STRIKEOUT_TABLE);
const STUFF_ATTR_TO_BA = invertAnchors(PITCHER_STUFF_TABLE);
const SUPPRESSION_ATTR_TO_SLG = invertAnchors(PITCHER_SUPPRESSION_TABLE);

// attr -> stat 轉換
function controlToBB(attr) { return interpolate(attr, CONTROL_ATTR_TO_BB); }
function strikeoutToK(attr) { return interpolate(attr, STRIKEOUT_ATTR_TO_K); }
function stuffToBA(attr) { return interpolate(attr, STUFF_ATTR_TO_BA); }
function suppressionToSLG(attr) { return interpolate(attr, SUPPRESSION_ATTR_TO_SLG); }

// STUFF：只調整「接觸→安打率」
function adjustHitOnContactByStuff(hitOnContactFromBatter, stuffAttr, alpha = 0.7) {
  const ba_p = stuffToBA(stuffAttr);
  const factor = Math.pow(ba_p / LEAGUE_AVG.BA, alpha);
  const val = hitOnContactFromBatter * factor;
  return Math.max(0, Math.min(0.99, val));
}

// 壓制：回傳長打調整係數（用於 XBH/HR）
function suppressionFactor(suppAttr, beta = 0.7) {
  const slg_p = suppressionToSLG(suppAttr);
  return Math.pow(slg_p / LEAGUE_AVG.SLG, beta);
}

// 計算投手允許的 wOBA（根據其屬性）
function computePitcherWOBA({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION }) {
  const stats = pitcherAttrsToStats({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION });

  // 使用標準 wOBA 公式計算對手打者的 wOBA
  // wOBA = (uBB*BB + uHBP*HBP + u1B*1B + u2B*2B + u3B*3B + uHR*HR) / (AB + BB + SF + HBP)
  // 簡化版：假設 HBP=0, SF=0, 且將 hits 按聯盟平均分配

  const BB_rate = stats.BB;           // 保送率
  const K_rate = stats.K;             // 三振率
  const BA = stats.BA;                // 被打擊率
  const SLG = stats.SLG;              // 被長打率

  // 計算 OBP（被上壘率）
  const OBP = BB_rate + BA * (1 - BB_rate);

  // 使用簡化的 wOBA 計算：wOBA ≈ 0.7*OBP + 0.3*SLG
  // 這是一個近似公式，實際 wOBA 計算更複雜
  const wOBA = 0.7 * OBP + 0.3 * SLG;

  return Math.max(0.15, Math.min(0.5, wOBA));  // 限制在合理範圍內
}

// 根據 wOBA 百分位數計算 OVR
function wobaPercentileToOVR(wobaValue) {
  // 先找到 wOBA 對應的百分位數
  let percentile = 50; // 預設為平均

  // 處理邊界情況：超越最佳投手
  if (wobaValue <= PITCHER_WOBA_PERCENTILES[0][0]) {
    percentile = 99; // 最佳投手
  }
  // 處理邊界情況：低於最差投手
  else if (wobaValue >= PITCHER_WOBA_PERCENTILES[PITCHER_WOBA_PERCENTILES.length - 1][0]) {
    percentile = 1; // 最差投手
  }
  // 正常插值
  else {
    for (let i = 0; i < PITCHER_WOBA_PERCENTILES.length - 1; i++) {
      const [woba1, pct1] = PITCHER_WOBA_PERCENTILES[i];
      const [woba2, pct2] = PITCHER_WOBA_PERCENTILES[i + 1];

      if (wobaValue >= woba1 && wobaValue <= woba2) {
        // 線性插值計算百分位數
        const ratio = (wobaValue - woba1) / (woba2 - woba1);
        percentile = pct1 + ratio * (pct2 - pct1);
        break;
      }
    }
  }

  // 再將百分位數轉換為 OVR
  let ovr = 70; // 預設為平均

  // 處理邊界情況：超過最高 OVR
  if (percentile >= PITCHER_WOBA_TO_OVR[0][0]) {
    ovr = PITCHER_WOBA_TO_OVR[0][1]; // 最高 OVR
  }
  // 處理邊界情況：低於最低 OVR
  else if (percentile <= PITCHER_WOBA_TO_OVR[PITCHER_WOBA_TO_OVR.length - 1][0]) {
    ovr = PITCHER_WOBA_TO_OVR[PITCHER_WOBA_TO_OVR.length - 1][1]; // 最低 OVR
  }
  // 正常插值
  else {
    for (let i = 0; i < PITCHER_WOBA_TO_OVR.length - 1; i++) {
      const [pct1, ovr1] = PITCHER_WOBA_TO_OVR[i];
      const [pct2, ovr2] = PITCHER_WOBA_TO_OVR[i + 1];

      if (percentile >= pct2 && percentile <= pct1) {
        // 線性插值計算 OVR
        const ratio = (percentile - pct2) / (pct1 - pct2);
        ovr = ovr2 + ratio * (ovr1 - ovr2);
        break;
      }
    }
  }

  return Math.round(ovr);
}

// 新的基於 wOBA 的投手 OVR 計算
function computePitcherOVRNew({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION }) {
  const woba = computePitcherWOBA({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION });
  return wobaPercentileToOVR(woba);
}

// 舊版投手 OVR（加權平均）：CONTROL 25%、STRIKEOUT 35%、STUFF 25%、SUPPRESSION 15%
const P_OVR_WEIGHTS = { CONTROL: 0.25, STRIKEOUT: 0.35, STUFF: 0.25, SUPPRESSION: 0.15 };
function computePitcherOVROld({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION }) {
  const w = P_OVR_WEIGHTS;
  const ovr = (CONTROL||0)*w.CONTROL + (STRIKEOUT||0)*w.STRIKEOUT + (STUFF||0)*w.STUFF + (SUPPRESSION||0)*w.SUPPRESSION;
  return Math.round(ovr);
}

// 使用新的 wOBA 版本作為預設 (可切換回舊版)
function computePitcherOVR(attrs) {
  // 選項 1: wOBA-based (可能不一致)
  // return computePitcherOVRNew(attrs);

  // 選項 2: 加權平均 (一致但不現實)
  return computePitcherOVROld(attrs);
}

// 快捷：四屬性 → 四項對戰統計
function pitcherAttrsToStats({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION }) {
  return { BB: controlToBB(CONTROL), K: strikeoutToK(STRIKEOUT), BA: stuffToBA(STUFF), SLG: suppressionToSLG(SUPPRESSION) };
}

// Node 匯出補強
if (typeof module !== 'undefined' && module.exports) {
  Object.assign(module.exports, {
    invertAnchors,
    reverseInterpolate,
    LEAGUE_AVG,
    PITCHER_WOBA_PERCENTILES,
    PITCHER_WOBA_TO_OVR,
    PITCHER_CONTROL_TABLE,
    PITCHER_STRIKEOUT_TABLE,
    PITCHER_STUFF_TABLE,
    PITCHER_SUPPRESSION_TABLE,
    CONTROL_ATTR_TO_BB,
    STRIKEOUT_ATTR_TO_K,
    STUFF_ATTR_TO_BA,
    SUPPRESSION_ATTR_TO_SLG,
    controlToBB,
    strikeoutToK,
    stuffToBA,
    suppressionToSLG,
    adjustHitOnContactByStuff,
    suppressionFactor,
    computePitcherWOBA,
    wobaPercentileToOVR,
    computePitcherOVRNew,
    computePitcherOVROld,
    P_OVR_WEIGHTS,
    computePitcherOVR,
    pitcherAttrsToStats
  });
}

// 瀏覽器全域補強
if (typeof window !== 'undefined') {
  window.invertAnchors = invertAnchors;
  window.reverseInterpolate = reverseInterpolate;
  window.LEAGUE_AVG = LEAGUE_AVG;
  window.PITCHER_WOBA_PERCENTILES = PITCHER_WOBA_PERCENTILES;
  window.PITCHER_WOBA_TO_OVR = PITCHER_WOBA_TO_OVR;
  window.PITCHER_CONTROL_TABLE = PITCHER_CONTROL_TABLE;
  window.PITCHER_STRIKEOUT_TABLE = PITCHER_STRIKEOUT_TABLE;
  window.PITCHER_STUFF_TABLE = PITCHER_STUFF_TABLE;
  window.PITCHER_SUPPRESSION_TABLE = PITCHER_SUPPRESSION_TABLE;
  window.CONTROL_ATTR_TO_BB = CONTROL_ATTR_TO_BB;
  window.STRIKEOUT_ATTR_TO_K = STRIKEOUT_ATTR_TO_K;
  window.STUFF_ATTR_TO_BA = STUFF_ATTR_TO_BA;
  window.SUPPRESSION_ATTR_TO_SLG = SUPPRESSION_ATTR_TO_SLG;
  window.controlToBB = controlToBB;
  window.strikeoutToK = strikeoutToK;
  window.stuffToBA = stuffToBA;
  window.suppressionToSLG = suppressionToSLG;
  window.adjustHitOnContactByStuff = adjustHitOnContactByStuff;
  window.suppressionFactor = suppressionFactor;
  window.computePitcherWOBA = computePitcherWOBA;
  window.wobaPercentileToOVR = wobaPercentileToOVR;
  window.computePitcherOVRNew = computePitcherOVRNew;
  window.computePitcherOVROld = computePitcherOVROld;
  window.P_OVR_WEIGHTS = P_OVR_WEIGHTS;
  window.computePitcherOVR = computePitcherOVR;
  window.pitcherAttrsToStats = pitcherAttrsToStats;
}
