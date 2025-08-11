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
    [0, 0.0005], [30, 0.003], [40, 0.0067], [60, 0.020],
    [70, 0.0333], [85, 0.045], [99, 0.0580], [115, 0.072],
    [125, 0.080], [130, 0.0870], [140, 0.098], [150, 0.110]
];

const BABIP_S_CURVE_HIT_ANCHORS = [
    [0, 0.215], [30, 0.245], [40, 0.270], [60, 0.295],
    [70, 0.305], [85, 0.330], [99, 0.350], [110, 0.365],
    [120, 0.375], [130, 0.385], [140, 0.395], [150, 0.405]
];

const BB_S_CURVE_EYE_ANCHORS = [
    [0, 0.030], [30, 0.045], [40, 0.062], [60, 0.075],
    [70, 0.085], [85, 0.105], [99, 0.125], [115, 0.145],
    [130, 0.160], [140, 0.170], [150, 0.180]
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

const AVG_2B_PER_HIT_BIP_NOT_HR_AT_MIDPOINT = 0.31;
const MIN_2B_PER_HIT_BIP_NOT_HR = 0.22;
const MAX_2B_PER_HIT_BIP_NOT_HR = 0.42;
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