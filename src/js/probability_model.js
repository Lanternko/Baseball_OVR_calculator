// new_probability_model.js - 四象限+兩階段打擊模擬系統
// 設計理念: 簡化、高效、符合棒球邏輯的單球決勝負系統

console.log('⚾ 載入新打擊模擬引擎...');

// 載入常數表 
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 環境
  const constants = require('./constants.js');
  const {
    EYE_BB_RATE_TABLE,
    EYE_EFFECT_TABLE,
    HIT_CONTACT_RATE_TABLE,
    HIT_QUALITY_RATIO_TABLE,
    HIT_EFFECT_TABLE,
    POW_FLYBALL_RATE_TABLE,
    POW_XBH_RATE_TABLE,
    POW_HR_XBH_RATIO_TABLE,
    interpolate,
    applyHITEffect
  } = constants;
  
  // 設定全域變數供函數使用
  global.EYE_BB_RATE_TABLE = EYE_BB_RATE_TABLE;
  global.EYE_EFFECT_TABLE = EYE_EFFECT_TABLE;
  global.HIT_CONTACT_RATE_TABLE = HIT_CONTACT_RATE_TABLE;
  global.HIT_QUALITY_RATIO_TABLE = HIT_QUALITY_RATIO_TABLE;
  global.HIT_EFFECT_TABLE = HIT_EFFECT_TABLE;
  global.POW_FLYBALL_RATE_TABLE = POW_FLYBALL_RATE_TABLE;
  global.POW_XBH_RATE_TABLE = POW_XBH_RATE_TABLE;
  global.POW_HR_XBH_RATIO_TABLE = POW_HR_XBH_RATIO_TABLE;
  global.interpolate = interpolate;
  global.applyHITEffect = applyHITEffect;
} else if (typeof window !== 'undefined') {
  // 瀏覽器環境：確保常數表已載入並可用
  if (typeof interpolate === 'undefined') {
    console.error('❌ 請先載入 constants.js');
    throw new Error('constants.js must be loaded before probability_model.js');
  }
  // 瀏覽器環境下變數已經是全域的，直接使用
}

// 核心計算函數

// 計算最終接觸率 (HIT基礎 + EYE磨球效果)
function calculateFinalContactRate(HIT, EYE) {
  // 1. HIT決定基礎接觸率
  const baseContactRate = interpolate(HIT, HIT_CONTACT_RATE_TABLE);
  
  // 2. 計算基礎揮空率
  const baseWhiffRate = 1 - baseContactRate;
  
  // 3. EYE減少揮空率 (磨球效果)
  const eyeEffect = interpolate(EYE, EYE_EFFECT_TABLE);
  const adjustedWhiffRate = baseWhiffRate * eyeEffect;
  
  // 4. 最終接觸率
  const finalContactRate = 1 - adjustedWhiffRate;
  
  return Math.min(0.999, finalContactRate); // 上限99.9%
}

// 計算接觸品質分配
function calculateContactQuality(HIT, contactType) {
  const qualityRatio = interpolate(HIT, HIT_QUALITY_RATIO_TABLE);
  
  if (contactType === 'quality') {
    return qualityRatio;
  } else {
    return 1 - qualityRatio; // weak contact
  }
}

// 四象限擊球處理系統

// 決定是否產生XBH (長打) - 第一階段
function determineXBHChance(HIT, POW, isQualityContact, isFlyball) {
  // 獲取基礎機率
  const qualityRatio = interpolate(HIT, HIT_QUALITY_RATIO_TABLE);
  const flyballRate = interpolate(POW, POW_FLYBALL_RATE_TABLE);
  const totalXBHRate = interpolate(POW, POW_XBH_RATE_TABLE);
  
  // 計算各象限的接觸占比（獨立假設）
  let quadrantContactRatio;
  if (isQualityContact && isFlyball) {
    quadrantContactRatio = qualityRatio * flyballRate;
  } else if (!isQualityContact && isFlyball) {
    quadrantContactRatio = (1 - qualityRatio) * flyballRate;
  } else if (isQualityContact && !isFlyball) {
    quadrantContactRatio = qualityRatio * (1 - flyballRate);
  } else {
    quadrantContactRatio = (1 - qualityRatio) * (1 - flyballRate);
  }
  
  // 各象限在總XBH中的目標占比
  let xbhShareTarget;
  if (isQualityContact && isFlyball) {
    xbhShareTarget = 0.60; // 高品質高飛球：60%的XBH
  } else if (!isQualityContact && isFlyball) {
    xbhShareTarget = 0.25; // 低品質高飛球：25%的XBH
  } else if (isQualityContact && !isFlyball) {
    xbhShareTarget = 0.12; // 高品質滾地球：12%的XBH
  } else {
    xbhShareTarget = 0.03; // 低品質滾地球：3%的XBH
  }
  
  // 計算該象限的XBH機率 = (目標XBH占比 × 總XBH率) ÷ 象限接觸占比
  const xbhProbability = (xbhShareTarget * totalXBHRate) / Math.max(0.001, quadrantContactRatio);
  
  return Math.min(0.95, xbhProbability); // 提高上限至95%
}

// XBH確定後的HR/2B分配 - 第二階段
function distributeXBH(POW, xbhContext) {
  // 使用統一的HR/XBH比例表
  let hrRatio = interpolate(POW, POW_HR_XBH_RATIO_TABLE);
  
  // 根據XBH來源進行微調
  switch(xbhContext) {
    case 'quality_flyball':
      // 高品質高飛球：HR率略高於平均
      hrRatio = Math.min(0.95, hrRatio * 1.2);
      break;
      
    case 'weak_flyball':
      // 低品質高飛球：暴力HR，HR率正常
      hrRatio = hrRatio; // 不調整
      break;
      
    case 'quality_grounder':
      // 高品質滾地球：主要是2B (穿越外野)
      hrRatio = Math.max(0.02, hrRatio * 0.2);
      break;
      
    case 'weak_grounder':
      // 低品質滾地球：幾乎都是2B
      hrRatio = Math.max(0.01, hrRatio * 0.1);
      break;
  }
  
  return {
    hrRatio: hrRatio,
    doubleRatio: 1 - hrRatio
  };
}

// 非XBH結果分配 (1B/OUT)
function distributeNonXBH(HIT, isQualityContact, isFlyball) {
  let baseSingleRate;
  
  if (isQualityContact && isFlyball) {
    // 高品質高飛球未成XBH：多為接殺，少數落地
    const baseCatchRate = 0.70;
    const adjustedCatchRate = applyHITEffect(baseCatchRate, HIT);
    baseSingleRate = 1 - adjustedCatchRate;
    
  } else if (!isQualityContact && isFlyball) {
    // 低品質高飛球未成XBH：主要接殺，HIT可救援
    const baseCatchRate = 0.85;
    const adjustedCatchRate = applyHITEffect(baseCatchRate, HIT);
    baseSingleRate = 1 - adjustedCatchRate;
    
  } else if (isQualityContact && !isFlyball) {
    // 高品質滾地球未成XBH：主要安打
    const baseOutRate = 0.15;
    const adjustedOutRate = applyHITEffect(baseOutRate, HIT);
    baseSingleRate = 1 - adjustedOutRate;
    
  } else {
    // 低品質滾地球未成XBH：主要出局，HIT可救援
    const baseOutRate = 0.80;
    const adjustedOutRate = applyHITEffect(baseOutRate, HIT);
    baseSingleRate = 1 - adjustedOutRate;
  }
  
  return {
    singleRate: Math.min(0.99, baseSingleRate), // 提高上限至99%
    outRate: 1 - Math.min(0.99, baseSingleRate)
  };
}

// 完整單球模擬流程
function simulateAtBat(EYE, HIT, POW, random1, random2, random3, random4) {
  // === 第一步：保送檢查 ===
  const bbRate = interpolate(EYE, EYE_BB_RATE_TABLE);
  if (random1 < bbRate) {
    return 'BB';
  }
  
  // === 第二步：接觸檢查 ===
  const contactRate = calculateFinalContactRate(HIT, EYE);
  const swingRate = 1 - bbRate; // 揮擊率 = 非保送率
  const actualContactThreshold = bbRate + (swingRate * contactRate); // 在總PA中的接觸門檻
  
  if (random1 >= actualContactThreshold) {
    return 'K'; // 揮空三振
  }
  
  // === 第三步：四象限分類 ===
  const qualityRatio = interpolate(HIT, HIT_QUALITY_RATIO_TABLE);
  const flyballRate = interpolate(POW, POW_FLYBALL_RATE_TABLE);
  
  const isQualityContact = random2 < qualityRatio;
  const isFlyball = (random4 || random3) < flyballRate; // 使用獨立隨機數
  
  // 決定XBH來源類型
  let xbhContext;
  if (isQualityContact && isFlyball) xbhContext = 'quality_flyball';
  else if (!isQualityContact && isFlyball) xbhContext = 'weak_flyball';
  else if (isQualityContact && !isFlyball) xbhContext = 'quality_grounder';
  else xbhContext = 'weak_grounder';
  
  // === 第四步：XBH檢查 ===
  const xbhProbability = determineXBHChance(HIT, POW, isQualityContact, isFlyball);
  
  if (random3 < xbhProbability) {
    // 產生XBH：分配HR/2B
    const xbhDistribution = distributeXBH(POW, xbhContext);
    const xbhRandom = (random3 / xbhProbability); // 重新標準化到0-1
    
    return xbhRandom < xbhDistribution.hrRatio ? 'HR' : '2B';
  }
  
  // === 第五步：非XBH分配 ===
  const nonXBHDistribution = distributeNonXBH(HIT, isQualityContact, isFlyball);
  const nonXBHRandom = (random3 - xbhProbability) / (1 - xbhProbability); // 重新標準化
  
  return nonXBHRandom < nonXBHDistribution.singleRate ? '1B' : 'OUT';
}

// 批量模擬多個打席 (高性能版本)
function simulateMultipleAtBats(EYE, HIT, POW, numAtBats = 600) {
  const results = {
    BB: 0, K: 0, HR: 0, '2B': 0, '1B': 0, OUT: 0
  };
  
  // 預先生成所有隨機數 (性能優化)
  const randoms1 = new Array(numAtBats);
  const randoms2 = new Array(numAtBats);
  const randoms3 = new Array(numAtBats);
  const randoms4 = new Array(numAtBats);
  
  for (let i = 0; i < numAtBats; i++) {
    randoms1[i] = Math.random();
    randoms2[i] = Math.random();
    randoms3[i] = Math.random();
    randoms4[i] = Math.random();
  }
  
  // 批量模擬
  for (let i = 0; i < numAtBats; i++) {
    const outcome = simulateAtBat(EYE, HIT, POW, randoms1[i], randoms2[i], randoms3[i], randoms4[i]);
    results[outcome]++;
  }
  
  return results;
}

// 計算統計數據
function calculateStats(simulationResults, pa = 600) {
  const { BB, K, HR, '2B': doubles, '1B': singles, OUT } = simulationResults;
  
  // 基礎計算
  const hits = HR + doubles + singles;
  const ab = pa - BB; // 假設沒有HBP
  const totalBases = HR * 4 + doubles * 2 + singles * 1;
  
  // 統計數據
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
    
    // 進階統計
    AVG: ab > 0 ? hits / ab : 0,
    OBP: pa > 0 ? (hits + BB) / pa : 0,
    SLG: ab > 0 ? totalBases / ab : 0,
    OPS: 0, // 後面計算
    
    // 機率統計
    'BB%': pa > 0 ? BB / pa : 0,
    'K%': pa > 0 ? K / pa : 0,
    'HR%': pa > 0 ? HR / pa : 0,
    'XBH%': pa > 0 ? (HR + doubles) / pa : 0
  };
}

// 完善統計計算
function finalizeStats(stats) {
  stats.OPS = stats.OBP + stats.SLG;
  return stats;
}

// 主要概率計算函數 (替代舊的 getPAEventProbabilities)
function getPAEventProbabilitiesNew(POW, HIT, EYE, playerHBPRate = 0) {
  // 使用大樣本模擬計算平均機率
  const simResults = simulateMultipleAtBats(EYE, HIT, POW, 10000);
  const total = 10000;
  
  return {
    HR: simResults.HR / total,
    '2B': simResults['2B'] / total,
    '1B': simResults['1B'] / total,
    BB: simResults.BB / total,
    HBP: playerHBPRate, // 保持兼容性
    K: simResults.K / total,
    IPO: simResults.OUT / total // OUT 映射到 IPO
  };
}

console.log('✅ 新打擊模擬引擎載入完成！');

// 全域變數導出
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 環境
  module.exports = {
    simulateAtBat,
    simulateMultipleAtBats,
    calculateStats,
    finalizeStats,
    getPAEventProbabilitiesNew,
    calculateFinalContactRate,
    determineXBHChance,
    distributeXBH
  };
  
  // Node.js 環境下也設置全域變數 (向下相容)
  global.getPAEventProbabilities = getPAEventProbabilitiesNew;
}

// 瀏覽器環境
if (typeof window !== 'undefined') {
  window.NEW_PROBABILITY_MODEL = {
    simulateAtBat,
    simulateMultipleAtBats,
    calculateStats,
    finalizeStats,
    getPAEventProbabilitiesNew,
    calculateFinalContactRate,
    determineXBHChance,
    distributeXBH
  };
  
  // 向下相容：覆寫舊函數
  window.getPAEventProbabilities = getPAEventProbabilitiesNew;
}

// Also support the original function name for backward compatibility
function getPAEventProbabilities(POW, HIT, EYE, playerHBPRate = 0) {
  return getPAEventProbabilitiesNew(POW, HIT, EYE, playerHBPRate);
}