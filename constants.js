// constants.js - 遊戲常數定義（修正版 v2.1）

// 聯盟基準值
const LEAGUE_BENCHMARKS = {
    'xBA': {'pr1': 0.200, 'pr50': 0.250, 'pr99': 0.330},
    'xSLG': {'pr1': 0.310, 'pr50': 0.400, 'pr99': 0.640},
    'xwOBA': {'pr1': 0.260, 'pr50': 0.320, 'pr99': 0.430}
};

const ATTRIBUTE_MAPPING_POINTS = {'pr1': 40, 'pr50': 70, 'pr99': 99};
const SOFT_CAP_ATTRIBUTE_VALUE = 150.0;
const ATTR_EFFECT_MIDPOINT = 70.0;

// 🔥 保持原版精確度的正常範圍 S-Curve 錨點（130以下完全不變）
const HR_S_CURVE_POW_ANCHORS = [
    [0, 0.008],     // Very low: ~5 HR/600 PA 
    [30, 0.012],    // 
    [40, 0.025],    // PR1: 2.5% HR rate (~15 HR/600 PA)
    [60, 0.035],    // 
    [70, 0.042],    // PR50: 4.2% HR rate (~25 HR/600 PA)
    [85, 0.055],    // 
    [99, 0.067],    // PR99: 6.7% HR rate (~40 HR/600 PA)
    [110, 0.083],   // MVP: 8.3% HR rate (~50 HR - Judge/Ohtani level)
    [120, 0.092],   // HOF: 9.2% HR rate (~55 HR)
    [130, 0.100],   // GOAT: 10% HR rate (~60 HR - Bonds level)
    [140, 0.108],   // Legendary: 10.8% HR rate
    [150, 0.115]    // Mythical: 11.5% HR rate (~70 HR)
];

const BABIP_S_CURVE_HIT_ANCHORS = [
    [0, 0.230],     // 提升: 0.220 → 0.230
    [30, 0.255],    // 提升: 0.250 → 0.255
    [40, 0.275],    // 提升: 0.270 → 0.275
    [60, 0.290],    // 提升: 0.285 → 0.290
    [70, 0.300],    // 提升: 0.295 → 0.300
    [85, 0.320],    // 提升: 0.315 → 0.320
    [99, 0.340],    // 提升: 0.330 → 0.340
    [110, 0.355],   // 提升: 0.345 → 0.355
    [120, 0.365],   // 提升: 0.355 → 0.365
    [130, 0.375],   // 提升: 0.365 → 0.375
    [140, 0.385],   // 提升: 0.375 → 0.385
    [150, 0.395]    // 提升: 0.385 → 0.395
];

const BB_S_CURVE_EYE_ANCHORS = [
    [0, 0.035],     // 提升: 0.030 → 0.035
    [30, 0.050],    // 提升: 0.045 → 0.050
    [40, 0.065],    // 提升: 0.060 → 0.065
    [60, 0.078],    // 提升: 0.073 → 0.078
    [70, 0.088],    // 提升: 0.083 → 0.088
    [85, 0.102],    // 提升: 0.098 → 0.102
    [99, 0.115],    // 降低: 0.120 → 0.115
    [115, 0.135],   // 降低: 0.140 → 0.135
    [130, 0.155],   // 提升: 0.150 → 0.155
    [140, 0.165],   // 提升: 0.160 → 0.165
    [150, 0.175]    // 提升: 0.170 → 0.175
];

const K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS = [
    [0, 0.8], [30, 0.5], [40, 0.3], [60, 0.1],
    [70, 0.0], [85, -0.20], [99, -0.40], [115, -0.55],
    [130, -0.70], [140, -0.75], [150, -0.80]
];

// 🔥 極端值專用的 S-Curve 錨點（僅在 200+ 時啟用）
const HR_S_CURVE_POW_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.0005], [30, 0.003], [40, 0.0067], [60, 0.020],
    [70, 0.0333], [85, 0.045], [99, 0.0580], [115, 0.072],
    [130, 0.0870], [140, 0.098], [150, 0.110],
    // 極端值區間開始
    [200, 0.300], [250, 0.450], [300, 0.600], [350, 0.750], 
    [400, 0.850], [450, 0.920], [500, 0.970]
];

const BABIP_S_CURVE_HIT_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.215], [30, 0.245], [40, 0.270], [60, 0.295],
    [70, 0.305], [85, 0.330], [99, 0.350], [110, 0.365],
    [120, 0.375], [130, 0.385], [140, 0.395], [150, 0.405],
    // 極端值區間開始
    [200, 0.550], [250, 0.650], [300, 0.750], [350, 0.840], 
    [400, 0.910], [450, 0.960], [500, 0.985]
];

const BB_S_CURVE_EYE_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.030], [30, 0.045], [40, 0.062], [60, 0.075],
    [70, 0.085], [85, 0.105], [99, 0.125], [115, 0.145],
    [130, 0.160], [140, 0.170], [150, 0.180],
    // 極端值區間開始
    [200, 0.350], [250, 0.480], [300, 0.600], [350, 0.720],
    [400, 0.820], [450, 0.900], [500, 0.950]
];

const K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.8], [30, 0.5], [40, 0.3], [60, 0.1],
    [70, 0.0], [85, -0.20], [99, -0.40], [115, -0.55],
    [130, -0.70], [140, -0.75], [150, -0.80],
    // 極端值區間開始
    [200, -0.85], [250, -0.88], [300, -0.90], [350, -0.92],
    [400, -0.94], [450, -0.96], [500, -0.98]
];

// 其他模型參數（保持不變）
const AVG_K_RATE_AT_MIDPOINT = 0.220;
const MIN_K_RATE_CAP = 0.080;
const MAX_K_RATE_CAP = 0.350;
const K_RATE_HIT_WEIGHT = 0.50;
const K_RATE_EYE_WEIGHT = 0.50;
const K_HIT_EFFECT_MIDPOINT = 70.0;
const K_HIT_EFFECT_SCALE = 55.0;

// 🔥 POW-dependent 2B rate system - Based on real MLB data patterns
const DOUBLES_RATE_S_CURVE_POW_ANCHORS = [
    [0, 0.20],      // Very low power: ~20 doubles (weak hitters)
    [40, 0.22],     // PR1: ~22 doubles (bottom 1% power)
    [70, 0.30],     // PR50: ~30 doubles (average power)
    [85, 0.35],     // Peak doubles zone: ~35 doubles (balanced power)
    [95, 0.37],     // Peak: ~37 doubles (Witt Jr/Freeman level)
    [110, 0.32],    // MVP power: ~32 doubles (HR takes some away)
    [120, 0.28],    // HOF power: ~28 doubles (more HR conversion) 
    [130, 0.25],    // GOAT power: ~25 doubles (Judge level)
    [140, 0.22],    // Legendary: ~22 doubles
    [150, 0.20]     // Mythical: ~20 doubles (max HR conversion)
];

const AVG_2B_PER_HIT_BIP_NOT_HR_AT_MIDPOINT = 0.30;
const MIN_2B_PER_HIT_BIP_NOT_HR = 0.20;
const MAX_2B_PER_HIT_BIP_NOT_HR = 0.37;
const EXTRABASE_POW_EFFECT_MIDPOINT = 70.0;
const EXTRABASE_POW_EFFECT_SCALE = 48.0;
const EXTRABASE_HIT_EFFECT_MIDPOINT = 70.0;
const EXTRABASE_HIT_EFFECT_SCALE = 48.0;
const EXTRABASE_POW_WEIGHT = 0.50;
const EXTRABASE_HIT_WEIGHT = 0.50;

const LEAGUE_AVG_HBP_RATE = 0.010;
const NUM_SIMULATIONS = 100; // 模擬次數

// 🔥 極端值檢測門檻（只有超過此值才使用極端值計算）
const EXTREME_VALUE_THRESHOLD = 200;

console.log('✅ Constants.js 載入完成 v2.1');

// 🔥 Debug: Check if DOUBLES_RATE_S_CURVE_POW_ANCHORS is properly defined
if (typeof DOUBLES_RATE_S_CURVE_POW_ANCHORS !== 'undefined') {
    console.log('✅ DOUBLES_RATE_S_CURVE_POW_ANCHORS loaded:', DOUBLES_RATE_S_CURVE_POW_ANCHORS);
} else {
    console.error('❌ DOUBLES_RATE_S_CURVE_POW_ANCHORS not defined!');
}