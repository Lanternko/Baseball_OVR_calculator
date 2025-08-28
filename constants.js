// constants.js - 遊戲常數定義（原始版本）

// 聯盟基準值 - 恢復原始基準作為穩定基礎
const LEAGUE_BENCHMARKS = {
    'xBA': {'pr1': 0.210, 'pr50': 0.250, 'pr99': 0.320},  // 基於 README MLB 範圍
    'xSLG': {'pr1': 0.320, 'pr50': 0.420, 'pr99': 0.570}, // 基於 README MLB 範圍
    'xwOBA': {'pr1': 0.280, 'pr50': 0.320, 'pr99': 0.420} // 基於 README MLB 範圍
};

const ATTRIBUTE_MAPPING_POINTS = {'pr1': 40, 'pr50': 70, 'pr99': 100};
const SOFT_CAP_ATTRIBUTE_VALUE = 150.0;
const ATTR_EFFECT_MIDPOINT = 70.0;

// 🔥 基於分析表精確調整的 HR S-Curve 錨點
const HR_S_CURVE_POW_ANCHORS = [
    [0, 0.008],     // Very low: ~5 HR/600 PA 
    [30, 0.012],    // 
    [40, 0.025],    // PR1: 2.5% HR rate (~15 HR/600 PA)
    [60, 0.035],    // 
    [70, 0.042],    // PR50: 4.2% HR rate (~25 HR/600 PA)
    [85, 0.060],    // 平滑過渡
    [95, 0.065],    // 添加95錨點: 6.5% HR rate
    [100, 0.070],   // 精確調整: 7.0% HR rate 使 SLG = 0.570 + 50%+ HR/XBH
    [110, 0.080],   // 平滑增加: 8.0% HR rate (~48 HR)
    [120, 0.090],   // 平滑增加: 9.0% HR rate (~54 HR)
    [130, 0.105],   // 史詩級: 10.5% HR rate (~63 HR - Ruth領域)
    [140, 0.115],   // 傳奇級: 11.5% HR rate (~69 HR - 接近Bonds)
    [150, 0.120]    // 極限級: 12.0% HR rate (~72 HR - 接近Bonds記錄)
];

const BABIP_S_CURVE_HIT_ANCHORS = [
    [0, 0.215],     // 極低水平
    [30, 0.240],    // 低水平
    [40, 0.255],    // PR1基準: 微調產生 BA 0.210
    [60, 0.275],    // 中等水平
    [70, 0.287],    // PR50基準: 微調產生 BA 0.250
    [80, 0.295],    // 平滑過渡
    [85, 0.300],    // 平滑過渡
    [90, 0.307],    // 平滑過渡
    [95, 0.330],    // 平滑過渡: 改善95-100轉換
    [100, 0.350],   // 精確調整: 產生 BA 0.320 (降低至 0.350)
    [110, 0.375],   // 平滑遞增 (+10)
    [120, 0.385],   // 平滑遞增 (+10)  
    [130, 0.395],   // 平滑遞增 (+10)
    [140, 0.405],   // 平滑遞增 (+10)
    [150, 0.480]    // 調整至README.md: 支援BA .380
];

const BB_S_CURVE_EYE_ANCHORS = [
    [0, 0.035],     // 極低水平
    [30, 0.048],    // 低水平
    [40, 0.050],    // PR1基準: 產生 OBP 0.280 (降低至 0.050)
    [60, 0.075],    // 中等水平
    [70, 0.085],    // PR50基準: 產生 OBP 0.320 ✅
    [80, 0.095],    // 平滑過渡
    [85, 0.105],    // 平滑過渡
    [90, 0.115],    // 平滑過渡
    [95, 0.125],    // 平滑過渡
    [100, 0.135],   // 精確調整: 使 OBP = 0.420 (降低至 0.135)
    [110, 0.180],   // 平滑遞增 (+20)
    [120, 0.220],   // 加速增加 (+40)
    [130, 0.280],   // 加速增加 (+60) - Ted Williams territory
    [140, 0.340],   // 加速增加 (+60) - Ruth territory  
    [150, 0.380]    // 極限增加 (+40) - 接近Bonds
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
    [85, 0.31],     // 平滑下降: 31 doubles
    [95, 0.31],     // 平滑下降: 31 doubles 
    [100, 0.30],    // Elite power: 30 doubles (balanced with HR)
    [110, 0.28],    // MVP power: 28 doubles (more HR conversion)
    [120, 0.26],    // HOF power: 26 doubles (aggressive HR conversion) 
    [130, 0.25],    // GOAT power: ~25 doubles (Judge level)
    [140, 0.22],    // Legendary: ~22 doubles
    [150, 0.20]     // Mythical: ~20 doubles (max HR conversion)
];

// 🔥 NEW: XBH-First Model - Total Extra Base Hits per 600 PA
const TOTAL_XBH_S_CURVE_POW_ANCHORS = [
    [0, 25],        // Very low power: ~25 XBH
    [40, 45],       // PR1: ~45 XBH (bottom 1%)
    [70, 65],       // PR50: ~65 XBH (average power)
    [85, 72],       // Good power: ~72 XBH
    [95, 74],       // 添加95錨點: ~74 XBH
    [100, 75],      // Elite power: ~75 XBH (targeting .570 SLG)
    [110, 80],      // MVP power: ~80 XBH
    [120, 85],      // HOF power: ~85 XBH
    [130, 90],      // GOAT power: ~90 XBH (Judge 2022 level)
    [140, 94],      // Legendary: ~94 XBH
    [150, 110]      // Mythical: ~110 XBH (README.md 極限)
];

// 🔥 NEW: HR/XBH Ratio - Based on real MLB elite performance
const HR_XBH_RATIO_S_CURVE_POW_ANCHORS = [
    [0, 0.25],      // Very low power: 25% HR/XBH
    [40, 0.33],     // PR1: 33% HR/XBH (bottom 1%)
    [70, 0.40],     // PR50: 40% HR/XBH (average power)
    [85, 0.48],     // Good power: 48% HR/XBH
    [95, 0.52],     // 添加95錨點: 52% HR/XBH
    [100, 0.55],    // Elite power: 55% HR/XBH (Ohtani 2023 level)
    [110, 0.61],    // MVP power: 61% HR/XBH (Judge 2024 level)
    [120, 0.66],    // HOF power: 66% HR/XBH
    [130, 0.69],    // GOAT power: 69% HR/XBH (Judge 2022 level)
    [140, 0.72],    // Legendary: 72% HR/XBH
    [150, 0.68]     // Mythical: 68% HR/XBH (~75 HR, 35 2B per README.md)
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

console.log('✅ Constants.js 載入完成 - 原始版本');

// 🔥 Debug: Check if DOUBLES_RATE_S_CURVE_POW_ANCHORS is properly defined
if (typeof DOUBLES_RATE_S_CURVE_POW_ANCHORS !== 'undefined') {
    console.log('✅ DOUBLES_RATE_S_CURVE_POW_ANCHORS loaded:', DOUBLES_RATE_S_CURVE_POW_ANCHORS);
} else {
    console.error('❌ DOUBLES_RATE_S_CURVE_POW_ANCHORS not defined!');
}