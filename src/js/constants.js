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

// 投手常數表（stat -> attr，基於 2025 賽季 MLB 百分位數）
const PITCHER_CONTROL_TABLE = [
  // BB%: pr1=3.6%, pr10=5.6%, pr25=6.9%, pr50=8.6%, pr75=10.6%, pr90=11.6%, pr99=14.8%
  [0.036, 150], [0.056, 120], [0.069, 100], [0.086, 70], [0.106, 40], [0.116, 20], [0.148, 1]
];
const PITCHER_STRIKEOUT_TABLE = [
  // K%: pr1=11.5%, pr10=16.4%, pr25=19.6%, pr50=22.6%, pr75=26.8%, pr90=29.3%, pr99=36.1%
  [0.115, 1], [0.164, 20], [0.196, 40], [0.226, 70], [0.268, 100], [0.293, 120], [0.361, 150]
];
const PITCHER_STUFF_TABLE = [
  // BAA: pr1=.184, pr10=.216, pr25=.242, pr50=.268, pr75=.288, pr90=.302, pr99=.348
  [0.184, 150], [0.216, 120], [0.242, 100], [0.268, 70], [0.288, 40], [0.302, 20], [0.348, 1]
];
const PITCHER_SUPPRESSION_TABLE = [
  // SLGA: pr1=.242, pr10=.343, pr25=.392, pr50=.442, pr75=.489, pr90=.519, pr99=.603
  [0.242, 150], [0.343, 120], [0.392, 100], [0.442, 70], [0.489, 40], [0.519, 20], [0.603, 1]
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

// 投手 OVR（加權平均）：CONTROL 25%、STRIKEOUT 35%、STUFF 25%、SUPPRESSION 15%
const P_OVR_WEIGHTS = { CONTROL: 0.25, STRIKEOUT: 0.35, STUFF: 0.25, SUPPRESSION: 0.15 };
function computePitcherOVR({ CONTROL, STRIKEOUT, STUFF, SUPPRESSION }) {
  const w = P_OVR_WEIGHTS;
  const ovr = (CONTROL||0)*w.CONTROL + (STRIKEOUT||0)*w.STRIKEOUT + (STUFF||0)*w.STUFF + (SUPPRESSION||0)*w.SUPPRESSION;
  return Math.round(ovr);
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
  window.P_OVR_WEIGHTS = P_OVR_WEIGHTS;
  window.computePitcherOVR = computePitcherOVR;
  window.pitcherAttrsToStats = pitcherAttrsToStats;
}
