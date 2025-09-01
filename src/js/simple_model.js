// simple_model.js - 簡化直觀的棒球模擬系統
// 設計理念: HIT→安打, POW→XBH, EYE→BB+接觸加成

console.log('⚾ 載入簡化模擬引擎...');

// ====================================
// 🎯 新的常數表架構（5個表）
// ====================================

// EYE決定保送率（保持不變）
const EYE_BB_RATE_TABLE = [
  [1, 0.001],    // 極低EYE: 0.1% BB率
  [20, 0.025],   // 業餘低端: 2.5% BB率
  [40, 0.05],    // pr1: 5% BB率
  [70, 0.087],   // pr50: 8.7% BB率
  [100, 0.170],  // pr99: 17% BB率
  [120, 0.20],   // 理論極限: 20% BB率
  [150, 0.270],  // 人類極限: 27% BB率
  [300, 0.450],  // 超人水準: 45% BB率
  [500, 0.800]   // 數學極限: 80% BB率
];

// 🆕 EYE對接觸率的小幅加成（新表）
const EYE_CONTACT_BONUS_TABLE = [
  [1, 0.000],    // 極低EYE: 無加成
  [20, 0.005],   // 業餘低端: +0.5% 接觸率
  [40, 0.010],   // pr1: +1% 接觸率
  [70, 0.018],   // pr50: +1.8% 接觸率
  [100, 0.030],  // pr99: +3% 接觸率（小幅提升BA）
  [120, 0.035],  // 理論極限: +3.5% 接觸率
  [150, 0.040],  // 人類極限: +4% 接觸率
  [300, 0.060],  // 超人水準: +6% 接觸率
  [500, 0.080]   // 數學極限: +8% 接觸率
];

// HIT決定基礎接觸率（保持不變）
const HIT_CONTACT_RATE_TABLE = [
  [1, 0.05],     // 極低HIT: 5% 總接觸率
  [20, 0.4],     // 業餘低端: 40% 總接觸率
  [40, 0.53],    // pr1: 53% 總接觸率
  [70, 0.59],    // pr50: 59% 總接觸率
  [100, 0.62],   // pr99: 62% 總接觸率
  [120, 0.65],   // 理論極限: 65% 總接觸率
  [150, 0.66],   // 人類極限: 66% 總接觸率
  [300, 0.85],   // 超人水準: 85% 總接觸率
  [500, 0.9]     // 數學極限: 90% 總接觸率
];

// 🆕 HIT決定接觸轉安打率（新表）
const HIT_SUCCESS_RATE_TABLE = [
  [1, 0.05],     // 極低HIT: 接觸中5%成安打
  [20, 0.25],    // 業餘低端: 接觸中25%成安打
  [40, 0.42],    // pr1: 接觸中42%成安打 → BA ≈ 53% × 42% = 0.22
  [70, 0.48],    // pr50: 接觸中48%成安打 → BA ≈ 59% × 48% = 0.28
  [100, 0.52],   // pr99: 接觸中52%成安打 → BA ≈ 62% × 52% = 0.32
  [120, 0.55],   // 理論極限: 接觸中55%成安打
  [150, 0.58],   // 人類極限: 接觸中58%成安打
  [300, 0.80],   // 超人水準: 接觸中80%成安打
  [500, 0.95]    // 數學極限: 接觸中95%成安打
];

// POW決定安打中XBH率（修正：基於安打而非接觸）
const POW_XBH_RATE_TABLE = [
  [1, 0.02],     // 極低POW: 安打中2%是XBH
  [20, 0.10],    // 業餘低端: 安打中10%是XBH
  [40, 0.18],    // pr1: 安打中18%是XBH → XBH ≈ BA × 18%
  [70, 0.25],    // pr50: 安打中25%是XBH → XBH ≈ BA × 25%
  [100, 0.35],   // pr99: 安打中35%是XBH → XBH ≈ BA × 35%
  [120, 0.42],   // 理論極限: 安打中42%是XBH
  [150, 0.50],   // 人類極限: 安打中50%是XBH
  [300, 0.75],   // 超人水準: 安打中75%是XBH
  [500, 0.95]    // 數學極限: 安打中95%是XBH
];

// POW決定XBH中HR比例（保持不變）
const POW_HR_RATIO_TABLE = [
  [1, 0.01],     // 極低POW: XBH中1%是HR
  [20, 0.05],    // 業餘低端: XBH中5%是HR
  [40, 0.129],   // pr1: XBH中12.9%是HR
  [70, 0.42],    // pr50: XBH中42%是HR
  [100, 0.5],    // pr99: XBH中50%是HR
  [120, 0.55],   // 理論極限: XBH中55%是HR
  [150, 0.77],   // 人類極限: XBH中77%是HR
  [300, 0.75],   // 超人水準: XBH中75%是HR
  [500, 0.99]    // 數學極限: XBH中99%是HR
];

// ====================================
// 🚀 簡化模擬引擎
// ====================================

// 插值函數（復用）
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

// 🎯 新的簡化模擬函數
function simulateSimpleAtBat(EYE, HIT, POW, random1, random2, random3, random4) {
  // === 第一步：保送檢查 ===
  const bbRate = interpolate(EYE, EYE_BB_RATE_TABLE);
  if (random1 < bbRate) {
    return 'BB';
  }
  
  // === 第二步：接觸檢查 (HIT基礎 + EYE小幅加成) ===
  const baseContactRate = interpolate(HIT, HIT_CONTACT_RATE_TABLE);
  const eyeContactBonus = interpolate(EYE, EYE_CONTACT_BONUS_TABLE);
  const finalContactRate = Math.min(0.99, baseContactRate + eyeContactBonus);
  
  // 調整接觸門檻（考慮保送後的剩餘機率空間）
  const remainingProbability = 1 - bbRate;
  const contactThreshold = bbRate + (remainingProbability * finalContactRate);
  
  if (random1 >= contactThreshold) {
    return 'K'; // 揮空三振
  }
  
  // === 第三步：安打檢查 (基於接觸) ===
  const hitSuccessRate = interpolate(HIT, HIT_SUCCESS_RATE_TABLE);
  if (random2 >= hitSuccessRate) {
    return 'OUT'; // 接觸但未成安打
  }
  
  // === 第四步：長打檢查 (基於安打) ===
  const xbhRate = interpolate(POW, POW_XBH_RATE_TABLE);
  if (random3 >= xbhRate) {
    return '1B'; // 一壘安打
  }
  
  // === 第五步：HR vs 2B分配 ===
  const hrRatio = interpolate(POW, POW_HR_RATIO_TABLE);
  return random4 < hrRatio ? 'HR' : '2B';
}

// 批量模擬函數
function simulateSimpleMultipleBats(EYE, HIT, POW, numAtBats = 600) {
  const results = {
    BB: 0, K: 0, HR: 0, '2B': 0, '1B': 0, OUT: 0
  };
  
  for (let i = 0; i < numAtBats; i++) {
    const outcome = simulateSimpleAtBat(
      EYE, HIT, POW, 
      Math.random(), Math.random(), Math.random(), Math.random()
    );
    results[outcome]++;
  }
  
  return results;
}

// 統計數據計算
function calculateSimpleStats(simulationResults, pa = 600) {
  const { BB, K, HR, '2B': doubles, '1B': singles, OUT } = simulationResults;
  
  const hits = HR + doubles + singles;
  const ab = pa - BB;
  const totalBases = HR * 4 + doubles * 2 + singles * 1;
  
  return {
    PA: pa,
    AB: ab,
    H: hits,
    HR: HR,
    '2B': doubles,
    '1B': singles,
    BB: BB,
    K: K,
    OUT: OUT,
    
    // 主要統計
    BA: ab > 0 ? hits / ab : 0,
    OBP: pa > 0 ? (hits + BB) / pa : 0,
    SLG: ab > 0 ? totalBases / ab : 0,
    OPS: 0, // 後面計算
    
    // 比率統計
    'BB%': pa > 0 ? BB / pa : 0,
    'K%': pa > 0 ? K / pa : 0,
    'HR%': pa > 0 ? HR / pa : 0,
    'XBH%': pa > 0 ? (HR + doubles) / pa : 0,
    
    // 額外統計（保持相容性）
    HR_count: HR,
    doubles_count: doubles,
    BB_rate: pa > 0 ? BB / pa : 0,
    K_rate: pa > 0 ? K / pa : 0
  };
}

// 完成統計計算
function finalizeSimpleStats(stats) {
  stats.OPS = stats.OBP + stats.SLG;
  return stats;
}

// 主要模擬接口（保持與舊系統相容）
function simulatePlayerStatsSimple(POW, HIT, EYE, iterations = 1000, pa = 600) {
  console.log(`🎯 簡化模擬: POW=${POW}, HIT=${HIT}, EYE=${EYE}, ${iterations}次模擬, ${pa}打席`);
  
  const simResults = simulateSimpleMultipleBats(EYE, HIT, POW, pa);
  const stats = calculateSimpleStats(simResults, pa);
  const finalStats = finalizeSimpleStats(stats);
  
  console.log(`📊 結果: BA=${finalStats.BA.toFixed(3)}, OBP=${finalStats.OBP.toFixed(3)}, SLG=${finalStats.SLG.toFixed(3)}`);
  console.log(`⚾ 長打: HR=${finalStats.HR}, 2B=${finalStats['2B']}, XBH=${finalStats.HR + finalStats['2B']}`);
  
  return finalStats;
}

// ====================================
// 📊 效果驗證函數
// ====================================

// 驗證HIT增加 → HR增加
function testHitToHR() {
  console.log('🧪 測試 HIT↑ → HR↑');
  
  const hitLevels = [40, 70, 100, 150];
  const fixedPOW = 100;
  const fixedEYE = 100;
  
  hitLevels.forEach(hit => {
    const stats = simulatePlayerStatsSimple(fixedPOW, hit, fixedEYE, 1000, 600);
    console.log(`HIT ${hit}: BA=${stats.BA.toFixed(3)}, HR=${stats.HR}, 總安打=${stats.H}`);
  });
}

// 驗證EYE增加 → BA小幅增加
function testEyeToBA() {
  console.log('🧪 測試 EYE↑ → BA小幅↑');
  
  const eyeLevels = [40, 70, 100, 150];
  const fixedPOW = 100;
  const fixedHIT = 100;
  
  eyeLevels.forEach(eye => {
    const stats = simulatePlayerStatsSimple(fixedPOW, fixedHIT, eye, 1000, 600);
    console.log(`EYE ${eye}: BA=${stats.BA.toFixed(3)}, OBP=${stats.OBP.toFixed(3)}, BB=${stats.BB}`);
  });
}

// 驗證POW增加 → HR大幅增加
function testPowToHR() {
  console.log('🧪 測試 POW↑ → HR大幅↑');
  
  const powLevels = [40, 70, 100, 150];
  const fixedHIT = 100;
  const fixedEYE = 100;
  
  powLevels.forEach(pow => {
    const stats = simulatePlayerStatsSimple(pow, fixedHIT, fixedEYE, 1000, 600);
    const xbh = stats.HR + stats['2B'];
    console.log(`POW ${pow}: SLG=${stats.SLG.toFixed(3)}, HR=${stats.HR}, XBH=${xbh}`);
  });
}

// 運行所有驗證測試
function runSimpleModelTests() {
  console.log('🚀 開始簡化模型驗證測試...');
  testHitToHR();
  console.log('---');
  testEyeToBA();
  console.log('---');
  testPowToHR();
  console.log('✅ 簡化模型測試完成！');
}

console.log('✅ 簡化模擬引擎載入完成！');

// 導出函數
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    simulatePlayerStatsSimple,
    simulateSimpleAtBat,
    simulateSimpleMultipleBats,
    calculateSimpleStats,
    runSimpleModelTests
  };
}

// 瀏覽器環境
if (typeof window !== 'undefined') {
  window.SIMPLE_MODEL = {
    simulatePlayerStatsSimple,
    simulateSimpleAtBat,
    simulateSimpleMultipleBats,
    calculateSimpleStats,
    runSimpleModelTests
  };
  
  // 全域函數
  window.simulatePlayerStatsSimple = simulatePlayerStatsSimple;
  window.runSimpleModelTests = runSimpleModelTests;
}