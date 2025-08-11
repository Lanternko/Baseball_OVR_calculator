// ovr-calculator.js - OVR 計算器（修正數據轉換精確度版）

// 🔥 修正版：數據轉三圍的計算函數（提高極端值精確度）
function calculatePlayerGameAttributes(xBA, xSLG, xwOBA) {
    const pr1_map = ATTRIBUTE_MAPPING_POINTS['pr1'];
    const pr50_map = ATTRIBUTE_MAPPING_POINTS['pr50'];
    const pr99_map = ATTRIBUTE_MAPPING_POINTS['pr99'];
    const delta_50_1 = pr50_map - pr1_map;
    const delta_99_50 = pr99_map - pr50_map;
    
    function getAttributeScoreExtreme(metricVal, pr1Benchmark, pr50Benchmark, pr99Benchmark, statType) {
        let score = 0;
        
        // 🔥 強化：理論極限值的精確處理
        const isExtremeValue = (
            (statType === 'BA' && metricVal >= 0.95) ||    // 降低門檻
            (statType === 'SLG' && metricVal >= 3.0) ||    // 降低門檻
            (statType === 'OBA' && metricVal >= 0.95)      // 降低門檻
        );
        
        if (isExtremeValue) {
            // 🔥 理論極限值映射到 500
            if (statType === 'BA' && metricVal >= 1.0) return 500;
            if (statType === 'SLG' && metricVal >= 3.5) return 500;  // 3.5+ 就給 500
            if (statType === 'OBA' && metricVal >= 1.0) return 500;
            
            // 🔥 強化極端值區間的映射
            if (statType === 'BA') {
                // 0.95-1.0 映射到 200-500
                return 200 + (metricVal - 0.95) / 0.05 * 300;
            }
            if (statType === 'SLG') {
                // 3.0-3.5 映射到 200-500
                return 200 + (metricVal - 3.0) / 0.5 * 300;
            }
            if (statType === 'OBA') {
                // 0.95-1.0 映射到 200-500
                return 200 + (metricVal - 0.95) / 0.05 * 300;
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
            // 🔥 改善超出 pr99 的線性擴展
            const slope_pr50_pr99 = delta_99_50 / (pr99Benchmark - pr50Benchmark);
            const basicExtension = pr99_map + slope_pr50_pr99 * (metricVal - pr99Benchmark);
            
            // 🔥 強化超高值的加成
            const overPr99Factor = (metricVal - pr99Benchmark) / (pr99Benchmark - pr50Benchmark);
            let extraBonus = 0;
            
            // 根據不同統計項目給予不同的加成
            if (statType === 'SLG') {
                // SLG 對應 POW，給予更激進的加成
                extraBonus = Math.min(overPr99Factor * 80, 300); // 最多額外+300
            } else if (statType === 'BA') {
                // BA 對應 HIT，中等加成
                extraBonus = Math.min(overPr99Factor * 60, 250); // 最多額外+250
            } else if (statType === 'OBA') {
                // OBA 對應 EYE，中等加成
                extraBonus = Math.min(overPr99Factor * 60, 250); // 最多額外+250
            }
            
            score = basicExtension + extraBonus;
        }
        
        return Math.max(0, Math.min(500, score));
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

// 🔥 修正版 OVR 計算函數 - 曲線自然接近 1000
function calculateBatterOVR(pow, hit, eye) {
    const arithmeticMean = (pow + hit + eye) / 3;
    const geometricMean = Math.pow(pow * hit * eye, 1/3);
    
    let baseOVR = arithmeticMean * 0.8 + geometricMean * 0.2;
    
    let eliteBonus = 0;
    
    // 精英加成系統（保持正常值精確度）
    if (arithmeticMean > 75) {
        const earlyEliteFactor = Math.min((arithmeticMean - 75) / 10, 1.0);
        eliteBonus += earlyEliteFactor * earlyEliteFactor * 1.5;
    }
    
    if (arithmeticMean > 85) {
        const midEliteFactor = Math.min((arithmeticMean - 85) / 14, 1.0);
        eliteBonus += midEliteFactor * midEliteFactor * 3.5;
    }
    
    if (arithmeticMean > 99) {
        const superEliteFactor = arithmeticMean - 99;
        eliteBonus += Math.log(1 + superEliteFactor) * 3.0;
    }
    
    // 極端值特殊加成
    if (arithmeticMean > 200) {
        const extremeFactor = arithmeticMean - 200;
        eliteBonus += Math.log(1 + extremeFactor) * 5.0;
    }
    
    if (arithmeticMean > 350) {
        const ultraExtremeFactor = arithmeticMean - 350;
        eliteBonus += Math.log(1 + ultraExtremeFactor) * 8.0;
    }
    
    // 個別屬性突破獎勵
    let breakthroughBonus = 0;
    [pow, hit, eye].forEach(attr => {
        if (attr > 90) {
            breakthroughBonus += (attr - 90) * 0.06;
        }
        if (attr > 105) {
            breakthroughBonus += (attr - 105) * 0.10;
        }
        if (attr > 120) {
            breakthroughBonus += (attr - 120) * 0.15;
        }
        if (attr > 200) {
            breakthroughBonus += (attr - 200) * 0.15;
        }
        if (attr > 350) {
            breakthroughBonus += (attr - 350) * 0.20;
        }
        if (attr > 450) {
            breakthroughBonus += (attr - 450) * 0.25;
        }
    });
    eliteBonus += breakthroughBonus;
    
    // 全面優秀獎勵
    const allAboveThresholds = [
        {threshold: 80, bonus: 0.8},
        {threshold: 85, bonus: 1.2},
        {threshold: 90, bonus: 1.8},
        {threshold: 95, bonus: 2.5},
        {threshold: 100, bonus: 3.5},
        {threshold: 110, bonus: 5.0},
        {threshold: 200, bonus: 15.0},
        {threshold: 300, bonus: 30.0},
        {threshold: 400, bonus: 50.0},
        {threshold: 500, bonus: 80.0}
    ];
    
    allAboveThresholds.forEach(({threshold, bonus}) => {
        if (pow > threshold && hit > threshold && eye > threshold) {
            const excessAvg = (pow + hit + eye) / 3 - threshold;
            eliteBonus += bonus + excessAvg * 0.05;
        }
    });
    
    // 均衡度調整
    const maxAttribute = Math.max(pow, hit, eye);
    const minAttribute = Math.min(pow, hit, eye);
    const balanceRatio = minAttribute / maxAttribute;
    
    if (balanceRatio > 0.7 && arithmeticMean > 75) {
        const balanceBonus = (balanceRatio - 0.7) * (arithmeticMean - 75) * 0.05;
        eliteBonus += balanceBonus;
    }
    
    // 極端專精補償
    const hasExtremeTalent = maxAttribute > 95;
    if (hasExtremeTalent && balanceRatio < 0.6) {
        const specializationBonus = (maxAttribute - 95) * 0.08 * (1 - balanceRatio);
        eliteBonus += specializationBonus;
    }
    
    // 實戰表現權重
    let performanceWeight = 1.0;
    const estimatedOPS = (pow * 0.006 + hit * 0.004 + eye * 0.005) + 0.2;
    
    if (estimatedOPS > 3.000) {
        performanceWeight += (estimatedOPS - 3.000) * 0.8;
    } else if (estimatedOPS > 2.000) {
        performanceWeight += (estimatedOPS - 2.000) * 0.6;
    } else if (estimatedOPS > 1.200) {
        performanceWeight += (estimatedOPS - 1.200) * 1.0;
    } else if (estimatedOPS > 1.000) {
        performanceWeight += (estimatedOPS - 1.000) * 0.6;
    } else if (estimatedOPS > 0.900) {
        performanceWeight += (estimatedOPS - 0.900) * 0.4;
    } else if (estimatedOPS > 0.800) {
        performanceWeight += (estimatedOPS - 0.800) * 0.2;
    }
    
    eliteBonus *= performanceWeight;
    
    // 🔥 修正：使用 S 型曲線自然接近 1000（而不是硬截斷）
    let finalOVR = baseOVR + eliteBonus;
    
    // 🔥 使用 sigmoid 函數讓 OVR 自然接近 1000
    // 參數調整讓 500/500/500 剛好接近 1000
    const targetMax = 1000;
    const steepness = 0.01; // 控制曲線陡峭度
    const midpoint = 800;   // 曲線中點
    
    // Sigmoid 轉換：f(x) = max / (1 + e^(-steepness * (x - midpoint)))
    finalOVR = targetMax / (1 + Math.exp(-steepness * (finalOVR - midpoint)));
    
    // 確保最小值為 1
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
        精英加成：+${breakdown.eliteBonus} (自然接近1000)<br>
        加成前：${breakdown.finalBeforeCap}<br>
        均衡度：${breakdown.balanceRatio}<br>
        表現權重：${breakdown.performanceWeight}x<br>
        預估 OPS：${breakdown.estimatedOPS}<br>
        全面80+：${breakdown.hasAllAbove80}<br>
        全面90+：${breakdown.hasAllAbove90}<br>
        極端值：${breakdown.hasExtreme}
    `;
    
    targetElement.innerHTML = html;
}// ovr-calculator.js - OVR 計算器（修正版）

// 數據轉三圍的計算函數（支援極端值）
function calculatePlayerGameAttributes(xBA, xSLG, xwOBA) {
    const pr1_map = ATTRIBUTE_MAPPING_POINTS['pr1'];
    const pr50_map = ATTRIBUTE_MAPPING_POINTS['pr50'];
    const pr99_map = ATTRIBUTE_MAPPING_POINTS['pr99'];
    const delta_50_1 = pr50_map - pr1_map;
    const delta_99_50 = pr99_map - pr50_map;
    
    function getAttributeScoreExtreme(metricVal, pr1Benchmark, pr50Benchmark, pr99Benchmark, statType) {
        let score = 0;
        
        // 理論極限值的特殊處理
        const isExtremeValue = (
            (statType === 'BA' && metricVal >= 0.99) ||
            (statType === 'SLG' && metricVal >= 3.8) ||
            (statType === 'OBA' && metricVal >= 0.99)
        );
        
        if (isExtremeValue) {
            if (statType === 'BA' && metricVal >= 1.0) return 500;
            if (statType === 'SLG' && metricVal >= 4.0) return 500;
            if (statType === 'OBA' && metricVal >= 1.0) return 500;
            
            if (statType === 'BA') {
                return 300 + (metricVal - 0.99) / 0.01 * 200;
            }
            if (statType === 'SLG') {
                return 300 + (metricVal - 3.8) / 0.2 * 200;
            }
            if (statType === 'OBA') {
                return 300 + (metricVal - 0.99) / 0.01 * 200;
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
            const slope_pr50_pr99 = delta_99_50 / (pr99Benchmark - pr50Benchmark);
            const basicExtension = pr99_map + slope_pr50_pr99 * (metricVal - pr99Benchmark);
            const overPr99Factor = (metricVal - pr99Benchmark) / (pr99Benchmark - pr50Benchmark);
            const extraBonus = Math.min(overPr99Factor * 50, 200);
            score = basicExtension + extraBonus;
        }
        
        return Math.max(0, Math.min(500, score));
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

// 🔥 修正版 OVR 計算函數 - 上限設為 1000，保持正常值精確度
function calculateBatterOVR(pow, hit, eye) {
    const arithmeticMean = (pow + hit + eye) / 3;
    const geometricMean = Math.pow(pow * hit * eye, 1/3);
    
    let baseOVR = arithmeticMean * 0.8 + geometricMean * 0.2;
    
    let eliteBonus = 0;
    
    // 🔥 修正：降低精英門檻，保持正常值的精確性
    if (arithmeticMean > 75) {
        const earlyEliteFactor = Math.min((arithmeticMean - 75) / 10, 1.0);
        eliteBonus += earlyEliteFactor * earlyEliteFactor * 1.5;
    }
    
    if (arithmeticMean > 85) {
        const midEliteFactor = Math.min((arithmeticMean - 85) / 14, 1.0);
        eliteBonus += midEliteFactor * midEliteFactor * 3.5;
    }
    
    if (arithmeticMean > 99) {
        const superEliteFactor = arithmeticMean - 99;
        eliteBonus += Math.log(1 + superEliteFactor) * 3.0;
    }
    
    // 🔥 極端值特殊加成（僅在 200+ 時大幅增強）
    if (arithmeticMean > 200) {
        const extremeFactor = arithmeticMean - 200;
        eliteBonus += Math.log(1 + extremeFactor) * 8.0;
    }
    
    if (arithmeticMean > 350) {
        const ultraExtremeFactor = arithmeticMean - 350;
        eliteBonus += Math.log(1 + ultraExtremeFactor) * 15.0;
    }
    
    // 個別屬性突破獎勵
    let breakthroughBonus = 0;
    [pow, hit, eye].forEach(attr => {
        if (attr > 90) {
            breakthroughBonus += (attr - 90) * 0.06;
        }
        if (attr > 105) {
            breakthroughBonus += (attr - 105) * 0.10;
        }
        if (attr > 120) {
            breakthroughBonus += (attr - 120) * 0.15;
        }
        // 🔥 極端值突破獎勵（僅在 200+ 時大幅增強）
        if (attr > 200) {
            breakthroughBonus += (attr - 200) * 0.25;
        }
        if (attr > 350) {
            breakthroughBonus += (attr - 350) * 0.40;
        }
        if (attr > 450) {
            breakthroughBonus += (attr - 450) * 0.60;
        }
    });
    eliteBonus += breakthroughBonus;
    
    // 全面優秀獎勵
    const allAboveThresholds = [
        {threshold: 80, bonus: 0.8},
        {threshold: 85, bonus: 1.2},
        {threshold: 90, bonus: 1.8},
        {threshold: 95, bonus: 2.5},
        {threshold: 100, bonus: 3.5},
        {threshold: 110, bonus: 5.0},
        // 🔥 極端值級別獎勵
        {threshold: 200, bonus: 25.0},
        {threshold: 300, bonus: 60.0},
        {threshold: 400, bonus: 120.0},
        {threshold: 500, bonus: 250.0}
    ];
    
    allAboveThresholds.forEach(({threshold, bonus}) => {
        if (pow > threshold && hit > threshold && eye > threshold) {
            const excessAvg = (pow + hit + eye) / 3 - threshold;
            eliteBonus += bonus + excessAvg * 0.1;
        }
    });
    
    // 均衡度調整
    const maxAttribute = Math.max(pow, hit, eye);
    const minAttribute = Math.min(pow, hit, eye);
    const balanceRatio = minAttribute / maxAttribute;
    
    if (balanceRatio > 0.7 && arithmeticMean > 75) {
        const balanceBonus = (balanceRatio - 0.7) * (arithmeticMean - 75) * 0.05;
        eliteBonus += balanceBonus;
    }
    
    // 極端專精補償
    const hasExtremeTalent = maxAttribute > 95;
    if (hasExtremeTalent && balanceRatio < 0.6) {
        const specializationBonus = (maxAttribute - 95) * 0.08 * (1 - balanceRatio);
        eliteBonus += specializationBonus;
    }
    
    // 實戰表現權重
    let performanceWeight = 1.0;
    const estimatedOPS = (pow * 0.006 + hit * 0.004 + eye * 0.005) + 0.2;
    
    // 🔥 極端值時大幅提升表現權重
    if (estimatedOPS > 3.000) {
        performanceWeight += (estimatedOPS - 3.000) * 2.0;
    } else if (estimatedOPS > 2.000) {
        performanceWeight += (estimatedOPS - 2.000) * 1.5;
    } else if (estimatedOPS > 1.200) {
        performanceWeight += (estimatedOPS - 1.200) * 1.0;
    } else if (estimatedOPS > 1.000) {
        performanceWeight += (estimatedOPS - 1.000) * 0.6;
    } else if (estimatedOPS > 0.900) {
        performanceWeight += (estimatedOPS - 0.900) * 0.4;
    } else if (estimatedOPS > 0.800) {
        performanceWeight += (estimatedOPS - 0.800) * 0.2;
    }
    
    eliteBonus *= performanceWeight;
    
    // 🔥 設定硬上限為 1000
    let finalOVR = baseOVR + eliteBonus;
    
    // 軟上限壓縮，確保正常值範圍準確
    if (finalOVR > 800) {
        finalOVR = 800 + (finalOVR - 800) * 0.3;
    } else if (finalOVR > 600) {
        finalOVR = 600 + (finalOVR - 600) * 0.5;
    } else if (finalOVR > 400) {
        finalOVR = 400 + (finalOVR - 400) * 0.7;
    }
    
    // 硬上限 1000
    finalOVR = Math.max(1, Math.min(1000, finalOVR));
    
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
        精英加成：+${breakdown.eliteBonus} (上限1000)<br>
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