// ovr-calculator.js - OVR 計算器

// 數據轉三圍的計算函數（支援極端值）
function calculatePlayerGameAttributes(xBA, xSLG, xwOBA) {
    const pr1_map = ATTRIBUTE_MAPPING_POINTS['pr1'];
    const pr50_map = ATTRIBUTE_MAPPING_POINTS['pr50'];
    const pr99_map = ATTRIBUTE_MAPPING_POINTS['pr99'];
    const delta_50_1 = pr50_map - pr1_map;
    const delta_99_50 = pr99_map - pr50_map;
    
    // 🔥 改進的極端值處理函數
    function getAttributeScoreExtreme(metricVal, pr1Benchmark, pr50Benchmark, pr99Benchmark, statType) {
        let score = 0;
        
        // 理論極限值的特殊處理
        const isExtremeValue = (
            (statType === 'BA' && metricVal >= 0.99) ||
            (statType === 'SLG' && metricVal >= 3.8) ||
            (statType === 'OBA' && metricVal >= 0.99)
        );
        
        if (isExtremeValue) {
            // 理論極限值：BA=1, SLG=4, OBA=1 都映射到相同的極高屬性值
            if (statType === 'BA' && metricVal >= 1.0) return 500;
            if (statType === 'SLG' && metricVal >= 4.0) return 500;
            if (statType === 'OBA' && metricVal >= 1.0) return 500;
            
            // 接近極限值的處理
            if (statType === 'BA') {
                return 300 + (metricVal - 0.99) / 0.01 * 200; // 0.99-1.0 映射到 300-500
            }
            if (statType === 'SLG') {
                return 300 + (metricVal - 3.8) / 0.2 * 200; // 3.8-4.0 映射到 300-500
            }
            if (statType === 'OBA') {
                return 300 + (metricVal - 0.99) / 0.01 * 200; // 0.99-1.0 映射到 300-500
            }
        }
        
        // 正常範圍的處理
        if (metricVal <= pr1Benchmark) {
            score = pr1_map;
        } else if (metricVal <= pr50Benchmark) {
            score = pr1_map + delta_50_1 * (metricVal - pr1Benchmark) / (pr50Benchmark - pr1Benchmark);
        } else if (metricVal <= pr99Benchmark) {
            score = pr50_map + delta_99_50 * (metricVal - pr50Benchmark) / (pr99Benchmark - pr50Benchmark);
        } else {
            // 超出 pr99 但未到極限的線性擴展
            const slope_pr50_pr99 = delta_99_50 / (pr99Benchmark - pr50Benchmark);
            const basicExtension = pr99_map + slope_pr50_pr99 * (metricVal - pr99Benchmark);
            
            // 對於超高值給予額外加成
            const overPr99Factor = (metricVal - pr99Benchmark) / (pr99Benchmark - pr50Benchmark);
            const extraBonus = Math.min(overPr99Factor * 50, 200); // 最多額外+200
            
            score = basicExtension + extraBonus;
        }
        
        return Math.max(0, Math.min(500, score)); // 允許最高到500
    }
    
    const powScore = getAttributeScoreExtreme(xSLG, LEAGUE_BENCHMARKS['xSLG']['pr1'], LEAGUE_BENCHMARKS['xSLG']['pr50'], LEAGUE_BENCHMARKS['xSLG']['pr99'], 'SLG');
    const hitScore = getAttributeScoreExtreme(xBA, LEAGUE_BENCHMARKS['xBA']['pr1'], LEAGUE_BENCHMARKS['xBA']['pr50'], LEAGUE_BENCHMARKS['xBA']['pr99'], 'BA');
    const eyeScore = getAttributeScoreExtreme(xwOBA, LEAGUE_BENCHMARKS['xwOBA']['pr1'], LEAGUE_BENCHMARKS['xwOBA']['pr50'], LEAGUE_BENCHMARKS['xwOBA']['pr99'], 'OBA');
    
    return {
        POW: Math.round(powScore),
        HIT: Math.round(hitScore),
        EYE: Math.round(eyeScore)
    };
}

// OVR 計算函數（支援極端值）
function calculateBatterOVR(pow, hit, eye) {
    // 算術平均作為基礎
    const arithmeticMean = (pow + hit + eye) / 3;
    
    // 幾何平均 (反映整體實力，避免短板效應)
    const geometricMean = Math.pow(pow * hit * eye, 1/3);
    
    // 基礎 OVR：算術平均為主，幾何平均為輔
    let baseOVR = arithmeticMean * 0.8 + geometricMean * 0.2;
    
    // === 更敏感的精英球員加成系統 ===
    let eliteBonus = 0;
    
    // 1. 降低精英門檻：從 75 開始溫和加成
    if (arithmeticMean > 75) {
        const earlyEliteFactor = Math.min((arithmeticMean - 75) / 10, 1.0); // 75-85的進度
        eliteBonus += earlyEliteFactor * earlyEliteFactor * 1.5; // 最多+1.5分
    }
    
    // 2. 中段精英加成（85-99區間）
    if (arithmeticMean > 85) {
        const midEliteFactor = Math.min((arithmeticMean - 85) / 14, 1.0); // 85-99的進度
        eliteBonus += midEliteFactor * midEliteFactor * 3.5; // 最多+3.5分
    }
    
    // 3. 超級精英加成（99+區間，對數增長）
    if (arithmeticMean > 99) {
        const superEliteFactor = arithmeticMean - 99;
        // 對數增長，但保留無上限特性
        eliteBonus += Math.log(1 + superEliteFactor) * 3.0;
    }
    
    // 4. 個別屬性突破獎勵（恢復適中強度）
    let breakthroughBonus = 0;
    [pow, hit, eye].forEach(attr => {
        if (attr > 90) { // 降低門檻從95到90
            breakthroughBonus += (attr - 90) * 0.06;
        }
        if (attr > 105) {
            breakthroughBonus += (attr - 105) * 0.10;
        }
        if (attr > 120) { // 超人級別
            breakthroughBonus += (attr - 120) * 0.15;
        }
        // 🔥 極端值特殊加成
        if (attr > 200) {
            breakthroughBonus += (attr - 200) * 0.25;
        }
        if (attr > 400) {
            breakthroughBonus += (attr - 400) * 0.50;
        }
    });
    eliteBonus += breakthroughBonus;
    
    // 5. 全面優秀獎勵（基於相關係數理論）
    const allAboveThresholds = [
        {threshold: 80, bonus: 0.8},  // 三圍都>80
        {threshold: 85, bonus: 1.2},  // 三圍都>85
        {threshold: 90, bonus: 1.8},  // 三圍都>90
        {threshold: 95, bonus: 2.5},  // 三圍都>95
        {threshold: 100, bonus: 3.5}, // 三圍都>100
        {threshold: 110, bonus: 5.0}, // 三圍都>110
        {threshold: 200, bonus: 15.0}, // 極端值級別
        {threshold: 300, bonus: 30.0}, // 超極端值級別
        {threshold: 500, bonus: 100.0} // 理論極限級別
    ];
    
    allAboveThresholds.forEach(({threshold, bonus}) => {
        if (pow > threshold && hit > threshold && eye > threshold) {
            const excessAvg = (pow + hit + eye) / 3 - threshold;
            eliteBonus += bonus + excessAvg * 0.1; // 基礎獎勵+超出部分
        }
    });
    
    // 6. 均衡度調整
    const maxAttribute = Math.max(pow, hit, eye);
    const minAttribute = Math.min(pow, hit, eye);
    const balanceRatio = minAttribute / maxAttribute;
    
    // 均衡獎勵（更敏感）
    if (balanceRatio > 0.7 && arithmeticMean > 75) { // 降低門檻
        const balanceBonus = (balanceRatio - 0.7) * (arithmeticMean - 75) * 0.05;
        eliteBonus += balanceBonus;
    }
    
    // 7. 極端專精補償
    const hasExtremeTalent = maxAttribute > 95;
    if (hasExtremeTalent && balanceRatio < 0.6) {
        const specializationBonus = (maxAttribute - 95) * 0.08 * (1 - balanceRatio);
        eliteBonus += specializationBonus;
    }
    
    // 8. 相關性調整（輕微）
    const correlationFactor = 0.75;
    const correlationAdjustment = correlationFactor * eliteBonus * 0.12;
    eliteBonus -= correlationAdjustment;
    
    // 9. 實戰表現權重（溫和）
    let performanceWeight = 1.0;
    const estimatedOPS = (pow * 0.006 + hit * 0.004 + eye * 0.005) + 0.2;
    
    if (estimatedOPS > 1.200) { // 神級 OPS
        performanceWeight += (estimatedOPS - 1.200) * 1.0;
    } else if (estimatedOPS > 1.000) { // 傳奇級 OPS
        performanceWeight += (estimatedOPS - 1.000) * 0.6;
    } else if (estimatedOPS > 0.900) { // 頂尖 OPS
        performanceWeight += (estimatedOPS - 0.900) * 0.4;
    } else if (estimatedOPS > 0.800) { // 優秀 OPS
        performanceWeight += (estimatedOPS - 0.800) * 0.2;
    }
    
    eliteBonus *= performanceWeight;
    
    // === 移除硬上限，僅保留軟上限壓縮 ===
    
    // 最終 OVR 計算
    let finalOVR = baseOVR + eliteBonus;
    
    // 多層軟上限，逐漸壓縮但不封頂
    if (finalOVR > 500) {
        finalOVR = 500 + (finalOVR - 500) * 0.1; // 500+ 區間大幅壓縮
    } else if (finalOVR > 200) {
        finalOVR = 200 + (finalOVR - 200) * 0.3; // 200-500 區間中度壓縮
    } else if (finalOVR > 140) {
        finalOVR = 140 + (finalOVR - 140) * 0.5; // 140-200 區間輕度壓縮
    }
    
    // 理論上不設上限，但實際上會因為軟上限而很難超過某個值
    finalOVR = Math.max(1, finalOVR);
    
    return {
        ovr: Math.round(finalOVR),
        breakdown: {
            arithmeticMean: arithmeticMean.toFixed(1),
            geometricMean: geometricMean.toFixed(1),
            baseOVR: baseOVR.toFixed(1),
            eliteBonus: eliteBonus.toFixed(1),
            balanceRatio: balanceRatio.toFixed(2),
            performanceWeight: performanceWeight.toFixed(2),
            estimatedOPS: estimatedOPS.toFixed(3),
            finalBeforeCap: (baseOVR + eliteBonus).toFixed(1),
            hasAllAbove80: (pow > 80 && hit > 80 && eye > 80) ? "✓" : "✗",
            hasAllAbove90: (pow > 90 && hit > 90 && eye > 90) ? "✓" : "✗",
            hasExtreme: (pow > 200 || hit > 200 || eye > 200) ? "✓" : "✗"
        }
    };
}

// 顯示 OVR 詳細分解
function displayOVRBreakdown(breakdown, targetElement) {
    if (!targetElement) return;
    
    const html = `
        <strong>OVR 計算詳情：</strong><br>
        算術平均：${breakdown.arithmeticMean}<br>
        基礎 OVR：${breakdown.baseOVR}<br>
        精英加成：+${breakdown.eliteBonus} (無硬上限)<br>
        加成前：${breakdown.finalBeforeCap}<br>
        均衡度：${breakdown.balanceRatio}<br>
        表現權重：${breakdown.performanceWeight}x<br>
        預估 OPS：${breakdown.estimatedOPS}<br>
        全面80+：${breakdown.hasAllAbove80}<br>
        全面90+：${breakdown.hasAllAbove90}<br>
        極端值：${breakdown.hasExtreme}
    `;
    
    targetElement.innerHTML = html;
}