// constants.js - 遊戲常數定義

// 聯盟基準值
const LEAGUE_BENCHMARKS = {
    'xBA': {'pr1': 0.200, 'pr50': 0.250, 'pr99': 0.330},
    'xSLG': {'pr1': 0.310, 'pr50': 0.400, 'pr99': 0.640},
    'xwOBA': {'pr1': 0.260, 'pr50': 0.320, 'pr99': 0.430}
};

const ATTRIBUTE_MAPPING_POINTS = {'pr1': 40, 'pr50': 70, 'pr99': 99};
const SOFT_CAP_ATTRIBUTE_VALUE = 150.0;
const ATTR_EFFECT_MIDPOINT = 70.0;

// 正常範圍的 S-Curve 錨點
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

// 🔥 極端值專用的 S-Curve 錨點
const HR_S_CURVE_POW_ANCHORS_EXTREME = [
    [0, 0.0005], [30, 0.003], [40, 0.0067], [60, 0.020],
    [70, 0.0333], [85, 0.045], [99, 0.0580], [115, 0.072],
    [130, 0.0870], [140, 0.098], [150, 0.110],
    [200, 0.200], [300, 0.400], [400, 0.700], [500, 0.990]
];

const BABIP_S_CURVE_HIT_ANCHORS_EXTREME = [
    [0, 0.215], [30, 0.245], [40, 0.270], [60, 0.295],
    [70, 0.305], [85, 0.330], [99, 0.350], [110, 0.380],
    [150, 0.450], [200, 0.550], [300, 0.750], [400, 0.900], [500, 0.980]
];

const BB_S_CURVE_EYE_ANCHORS_EXTREME = [
    [0, 0.030], [30, 0.045], [40, 0.062], [60, 0.075],
    [70, 0.085], [85, 0.105], [99, 0.125], [115, 0.145],
    [130, 0.160], [140, 0.170], [150, 0.180],
    [200, 0.300], [300, 0.500], [400, 0.750], [500, 0.950]
];

const K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS_EXTREME = [
    [0, 0.8], [30, 0.5], [40, 0.3], [60, 0.1],
    [70, 0.0], [85, -0.20], [99, -0.40], [115, -0.55],
    [130, -0.70], [140, -0.75], [150, -0.80],
    [200, -0.90], [300, -0.95], [400, -0.98], [500, -0.99]
];

// 其他模型參數
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

// 極端值檢測門檻
const EXTREME_VALUE_THRESHOLD = 200;