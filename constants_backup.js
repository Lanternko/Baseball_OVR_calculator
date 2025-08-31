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

// 🔥 基於10年研究數據的 HR S-Curve 錨點 (Official Targets) - 修正Level 40 HR產出
const HR_S_CURVE_POW_ANCHORS = [
    [0, 0.003],     // Very low: ~2 HR/600 PA 
    [30, 0.005],    // Low: ~3 HR
    [40, 0.012],    // PR1: 1.2% HR rate (~4 HR/600 PA) - 大幅提升修正0 HR問題
    [50, 0.025],    // 過渡期: 大幅增加
    [60, 0.030],    // Rising towards average
    [70, 0.035],    // PR50: 3.5% HR rate (~21 HR/600 PA) - Official Target
    [85, 0.055],    // 平滑過渡
    [95, 0.070],    // 添加95錨點: 7.0% HR rate
    [100, 0.075],   // PR99: 7.5% HR rate (~45 HR/600 PA) - Official Target
    [110, 0.085],   // 平滑增加: 8.5% HR rate
    [120, 0.092],   // HOF Peak: 9.2% HR rate (~55 HR) - Official Target
    [130, 0.105],   // 史詩級: 10.5% HR rate
    [140, 0.110],   // 傳奇級: 11.0% HR rate
    [150, 0.117]    // 極限級: 11.7% HR rate (~70 HR) - Official Target
];

const BABIP_S_CURVE_HIT_ANCHORS = [
    [0, 0.215],     // 極低水平
    [30, 0.240],    // 低水平
    [40, 0.320],    // PR1基準: 產生 BA 0.210 - Official Target
    [60, 0.375],    // 中等水平: 調整以支援新目標
    [70, 0.370],    // PR50基準: 產生 BA 0.260 - Official Target (降低)
    [80, 0.410],    // 平滑過渡
    [85, 0.425],    // 平滑過渡
    [90, 0.440],    // 平滑過渡
    [95, 0.450],    // 平滑過渡: 改善95-100轉換
    [100, 0.450],   // PR99: 產生 BA 0.320 - Official Target
    [110, 0.480],   // 平滑遞增
    [120, 0.480],   // HOF Peak: 產生 BA 0.350 - Official Target (降低)
    [130, 0.550],   // 平滑遞增
    [140, 0.590],   // 平滑遞增
    [150, 0.670]    // Fantasy: 產生 BA 0.400 - Official Target (精準調整)
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
    [150, 0.450]    // 調整至README.md: 支援OBP .570
];

const K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS = [
    [0, 0.8], [30, 0.5], [40, 0.3], [60, 0.1],
    [70, 0.0], [85, -0.20], [100, -0.40], [115, -0.55],
    [130, -0.70], [140, -0.75], [150, -0.80]
];

// 🔥 極端值專用的 S-Curve 錨點（僅在 200+ 時啟用）
const HR_S_CURVE_POW_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.0005], [30, 0.003], [40, 0.0067], [60, 0.020],
    [70, 0.0333], [85, 0.045], [100, 0.0580], [115, 0.072],
    [130, 0.0870], [140, 0.098], [150, 0.110],
    // 極端值區間開始
    [200, 0.300], [250, 0.450], [300, 0.600], [350, 0.750], 
    [400, 0.850], [450, 0.920], [500, 0.970]
];

const BABIP_S_CURVE_HIT_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.215], [30, 0.245], [40, 0.270], [60, 0.295],
    [70, 0.305], [85, 0.330], [100, 0.350], [110, 0.365],
    [120, 0.375], [130, 0.385], [140, 0.395], [150, 0.405],
    // 極端值區間開始
    [200, 0.550], [250, 0.650], [300, 0.750], [350, 0.840], 
    [400, 0.910], [450, 0.960], [500, 0.985]
];

const BB_S_CURVE_EYE_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.030], [30, 0.045], [40, 0.062], [60, 0.075],
    [70, 0.085], [85, 0.105], [100, 0.125], [115, 0.145],
    [130, 0.160], [140, 0.170], [150, 0.180],
    // 極端值區間開始
    [200, 0.350], [250, 0.480], [300, 0.600], [350, 0.720],
    [400, 0.820], [450, 0.900], [500, 0.950]
];

const K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS_EXTREME = [
    // 保持 0-150 的原版數值
    [0, 0.8], [30, 0.5], [40, 0.3], [60, 0.1],
    [70, 0.0], [85, -0.20], [100, -0.40], [115, -0.55],
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

// 🔥 NEW: XBH-First Model - 基於10年研究數據的 XBH 錨點 (Official Targets)
const TOTAL_XBH_S_CURVE_POW_ANCHORS = [
    [0, 20],        // Very low power: ~20 XBH
    [40, 35],       // PR1: ~35 XBH (for SLG .320) - Official Target
    [70, 60],       // PR50: ~60 XBH (for SLG .440) - Official Target  
    [85, 68],       // Good power: ~68 XBH
    [95, 72],       // 添加95錨點: ~72 XBH
    [100, 78],      // PR99: ~78 XBH (for SLG .600) - Official Target
    [110, 82],      // MVP power: ~82 XBH
    [120, 85],      // HOF Peak: ~85 XBH (for SLG .700) - Official Target
    [130, 90],      // GOAT power: ~90 XBH
    [140, 95],      // Legendary: ~95 XBH
    [150, 70]       // Fantasy: ~70 XBH (precision for SLG .900) - Official Target
];

// 🔥 基於10年研究數據的 HR/XBH 比例 (Official Targets)
const HR_XBH_RATIO_S_CURVE_POW_ANCHORS = [
    [0, 0.20],      // Very low power: 20% HR/XBH
    [40, 0.114],    // PR1: 11.4% HR/XBH (4 HR / 35 XBH) - Official Target
    [70, 0.35],     // PR50: 35% HR/XBH (21 HR / 60 XBH) - Official Target
    [85, 0.50],     // Good power: 50% HR/XBH
    [95, 0.55],     // 添加95錨點: 55% HR/XBH
    [100, 0.577],   // PR99: 57.7% HR/XBH (45 HR / 78 XBH) - Official Target
    [110, 0.62],    // MVP power: 62% HR/XBH
    [120, 0.647],   // HOF Peak: 64.7% HR/XBH (55 HR / 85 XBH) - Official Target
    [130, 0.69],    // GOAT power: 69% HR/XBH
    [140, 0.72],    // Legendary: 72% HR/XBH
    [150, 0.857]    // Fantasy: 85.7% HR/XBH (60 HR / 70 XBH) - Target SLG .900
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