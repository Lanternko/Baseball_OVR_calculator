// ovr-calculator.js - 混合轉換版 OVR 計算器

// 🔥 混合轉換函數：PR1 以下對數平滑，PR1 以上保持原版
function getAttributeScoreHybrid(metricVal, pr1Benchmark, pr50Benchmark, pr99Benchmark, statType) {
    const pr1_map = ATTRIBUTE_MAPPING_POINTS['pr1']; // 40
    const pr50_map = ATTRIBUTE_MAPPING_POINTS['pr50']; // 70
    const pr99_map = ATTRIBUTE_MAPPING_POINTS['pr99']; // 99
    const delta_50_1 = pr50_map - pr1_map;
    const delta_99_50 = pr99_map - pr50_map;
    
    // 🔥 關鍵判斷：是否在 PR1 以下的區間
    if (metricVal <= pr1Benchmark) {
        // 🔥 PR1 以下使用對數平滑函數
        
        let theoreticalMin = 0.000; // 所有統計都從 0 開始
        
        if (metricVal <= theoreticalMin) {
            return 0.1; // 極限值設為 0.1，避免 0 值問題
        }
        
        // 🔥 對數函數：上凸曲線，極限趨近於 0
        const normalizedProgress = (metricVal - theoreticalMin) / (pr1Benchmark - theoreticalMin);
        
       // 調整對數平滑參數以改善 40 屬性轉換
        const k = 4.0; // 降低: 5.0 → 4.0 (減少彎曲度)
        const logScore = pr1_map * Math.log(1 + k * normalizedProgress) / Math.log(1 + k);
        
        // 微調基準點對應
        if (statType === 'SLG') {
            return Math.max(0.1, logScore * 1.02); // POW 小幅提升
        }
        
        return Math.max(0.1, logScore);
    }
    
    // 🔥 PR1 以上完全使用原版邏輯 (保持不變)
    else {
        let score = 0;
        
        // 極值處理 (原版邏輯)
        const isExtremeValue = (
            (statType === 'BA' && metricVal >= 0.95) ||
            (statType === 'SLG' && metricVal >= 3.0) ||
            (statType === 'OBA' && metricVal >= 0.95)
        );
        
        if (isExtremeValue) {
            if (statType === 'BA' && metricVal >= 1.0) return 500;
            if (statType === 'SLG' && metricVal >= 3.5) return 500;
            if (statType === 'OBA' && metricVal >= 1.0) return 500;
            
            if (statType === 'BA') {
                return 200 + (metricVal - 0.95) / 0.05 * 300;
            }
            if (statType === 'SLG') {
                return 200 + (metricVal - 3.0) / 0.5 * 300;
            }
            if (statType === 'OBA') {
                return 200 + (metricVal - 0.95) / 0.05 * 300;
            }
        }
        
        // PR1 → PR50 (原版邏輯)
        if (metricVal <= pr50Benchmark) {
            score = pr1_map + delta_50_1 * (metricVal - pr1Benchmark) / (pr50Benchmark - pr1Benchmark);
        }
        // PR50 → PR99 (原版邏輯)
        else if (metricVal <= pr99Benchmark) {
            score = pr50_map + delta_99_50 * (metricVal - pr50Benchmark) / (pr99Benchmark - pr50Benchmark);
        }
        // PR99 以上 (原版邏輯)
        else {
            const slope_pr50_pr99 = delta_99_50 / (pr99Benchmark - pr50Benchmark);
            const basicExtension = pr99_map + slope_pr50_pr99 * (metricVal - pr99Benchmark);
            const overPr99Factor = (metricVal - pr99Benchmark) / (pr99Benchmark - pr50Benchmark);
            let extraBonus = 0;
            
            if (statType === 'SLG') {
                extraBonus = Math.min(overPr99Factor * 80, 300);
            } else if (statType === 'BA') {
                extraBonus = Math.min(overPr99Factor * 60, 250);
            } else if (statType === 'OBA') {
                extraBonus = Math.min(overPr99Factor * 60, 250);
            }
            
            score = basicExtension + extraBonus;
        }
        
        return Math.max(0.1, Math.min(500, score));
    }
}

// 🔥 數據轉三圍主函數（使用混合轉換）
function calculatePlayerGameAttributes(xBA, xSLG, xwOBA) {
    // 輸入處理
    const safeXBA = parseFloat(xBA) || 0;
    const safeXSLG = parseFloat(xSLG) || 0;
    const safeXwOBA = parseFloat(xwOBA) || 0;
    
    console.log('混合轉換輸入:', { xBA: safeXBA, xSLG: safeXSLG, xwOBA: safeXwOBA });
    
    // 🔥 使用混合轉換函數
    const powScore = getAttributeScoreHybrid(safeXSLG, LEAGUE_BENCHMARKS['xSLG']['pr1'], LEAGUE_BENCHMARKS['xSLG']['pr50'], LEAGUE_BENCHMARKS['xSLG']['pr99'], 'SLG');
    const hitScore = getAttributeScoreHybrid(safeXBA, LEAGUE_BENCHMARKS['xBA']['pr1'], LEAGUE_BENCHMARKS['xBA']['pr50'], LEAGUE_BENCHMARKS['xBA']['pr99'], 'BA');
    const eyeScore = getAttributeScoreHybrid(safeXwOBA, LEAGUE_BENCHMARKS['xwOBA']['pr1'], LEAGUE_BENCHMARKS['xwOBA']['pr50'], LEAGUE_BENCHMARKS['xwOBA']['pr99'], 'OBA');
    
    console.log('混合轉換結果:', { POW: powScore, HIT: hitScore, EYE: eyeScore });
    
    return {
        POW: powScore,
        HIT: hitScore,
        EYE: eyeScore
    };
}

// 🔧 簡化版 OVR 計算函數（移除雜訊資訊）
function calculateBatterOVR(pow, hit, eye) {
    // 🔧 嚴格的輸入驗證
    const safePOW = parseFloat(pow) || 1;
    const safeHIT = parseFloat(hit) || 1;
    const safeEYE = parseFloat(eye) || 1;
    
    console.log('OVR計算輸入:', { pow: safePOW, hit: safeHIT, eye: safeEYE });
    
    if (safePOW <= 0 || safeHIT <= 0 || safeEYE <= 0) {
        console.error('OVR計算錯誤：屬性值必須為正數');
        return { 
            ovr: 1, 
            breakdown: { 
                arithmeticMean: '1.0',
                baseOVR: '1.0', 
                eliteBonus: '0.0',
                balanceRatio: '1.00',
                error: '屬性值無效'
            } 
        };
    }
    
    const arithmeticMean = (safePOW + safeHIT + safeEYE) / 3;
    const geometricMean = Math.pow(safePOW * safeHIT * safeEYE, 1/3);
    
    // 🔧 檢查計算結果有效性
    if (isNaN(arithmeticMean) || isNaN(geometricMean)) {
        console.error('OVR計算錯誤：平均值計算失敗', { arithmeticMean, geometricMean });
        return { 
            ovr: 1, 
            breakdown: { 
                arithmeticMean: '1.0',
                baseOVR: '1.0',
                eliteBonus: '0.0', 
                balanceRatio: '1.00',
                error: '計算失敗'
            } 
        };
    }
    
    let baseOVR = arithmeticMean * 0.8 + geometricMean * 0.2;
    let eliteBonus = 0;
    
    // 精英加成系統（簡化版，避免複雜計算）
    if (arithmeticMean > 75) {
        const factor = Math.min((arithmeticMean - 75) / 25, 1.0);
        eliteBonus += factor * factor * 2.0;
    }
    
    if (arithmeticMean > 90) {
        const factor = Math.min((arithmeticMean - 90) / 20, 1.0);
        eliteBonus += factor * factor * 5.0;
    }
    
    // 極端值特殊處理
    if (arithmeticMean > 200) {
        const factor = Math.min((arithmeticMean - 200) / 100, 1.0);
        eliteBonus += factor * 20.0;
    }
    
    // 均衡度調整
    const maxAttribute = Math.max(safePOW, safeHIT, safeEYE);
    const minAttribute = Math.min(safePOW, safeHIT, safeEYE);
    const balanceRatio = minAttribute / maxAttribute;
    
    if (balanceRatio > 0.8 && arithmeticMean > 60) {
        eliteBonus += (balanceRatio - 0.8) * arithmeticMean * 0.02;
    }
    
    let finalOVR = baseOVR + eliteBonus;
    finalOVR = Math.max(1, Math.min(1000, finalOVR));
    
    console.log('OVR計算結果:', { 
        arithmeticMean: arithmeticMean.toFixed(1),
        baseOVR: baseOVR.toFixed(1),
        eliteBonus: eliteBonus.toFixed(1),
        finalOVR: finalOVR.toFixed(1)
    });
    
    return {
        ovr: Math.round(finalOVR),
        breakdown: {
            arithmeticMean: arithmeticMean.toFixed(1),
            baseOVR: baseOVR.toFixed(1),
            eliteBonus: eliteBonus.toFixed(1),
            balanceRatio: balanceRatio.toFixed(2)
        }
    };
}

// 🎯 聯盟水準判定函數
function getLeagueLevel(ovr) {
    if (ovr >= 110) return "歷史最強 🐐";
    if (ovr >= 99) return "當代最強 👑";
    if (ovr >= 95) return "頂尖選手 🔥";
    if (ovr >= 85) return "可靠主力 ⭐";
    if (ovr >= 70) return "平均先發 📈";
    if (ovr >= 40) return "大聯盟替補 ⚾";
    return "小聯盟水準 📉";
}

// 🎯 均衡度描述函數
function getBalanceDescription(ratio) {
    if (ratio >= 0.95) return "(完美均衡)";
    if (ratio >= 0.85) return "(優秀均衡)";
    if (ratio >= 0.70) return "(良好均衡)";
    if (ratio >= 0.55) return "(略有偏科)";
    return "(明顯偏科)";
}

// 🎯 精簡版 OVR 分解顯示（移除雜訊）
function displayOVRBreakdown(breakdown, targetElement) {
    if (!targetElement) return;
    
    // 🔧 更安全的 OVR 獲取方式
    let ovr = 1;
    try {
        const ovrElement = targetElement.parentElement.querySelector('.ovr-number');
        ovr = parseInt(ovrElement.textContent) || 1;
    } catch (e) {
        console.error('無法獲取 OVR 值:', e);
    }
    
    const html = `
        <strong>評價詳情：</strong><br>
        平均能力值：${breakdown.arithmeticMean}<br>
        基礎評價：${breakdown.baseOVR}<br>
        精英加成：+${breakdown.eliteBonus}<br>
        均衡度：${breakdown.balanceRatio} ${getBalanceDescription(parseFloat(breakdown.balanceRatio))}<br>
        <strong>聯盟水準：${getLeagueLevel(ovr)}</strong>
        ${breakdown.error ? `<br><span style="color: red;">錯誤: ${breakdown.error}</span>` : ''}
    `;
    
    targetElement.innerHTML = html;
}

// 🧪 測試混合系統（可選）
function testHybridSystem() {
    console.log('🧪 測試混合轉換系統...');
    
    const testCases = [
        {name: '極低值', xBA: 0.001, xSLG: 0.004, xwOBA: 0.031},
        {name: 'PR1 邊界', xBA: 0.200, xSLG: 0.310, xwOBA: 0.260},
        {name: 'Judge 2024', xBA: 0.322, xSLG: 0.701, xwOBA: 0.458},
        {name: 'Ohtani 2024', xBA: 0.310, xSLG: 0.646, xwOBA: 0.390}
    ];
    
    testCases.forEach(testCase => {
        const result = calculatePlayerGameAttributes(testCase.xBA, testCase.xSLG, testCase.xwOBA);
        console.log(`${testCase.name}: POW=${result.POW.toFixed(1)}, HIT=${result.HIT.toFixed(1)}, EYE=${result.EYE.toFixed(1)}`);
    });
}

// 運行測試（可選）
// testHybridSystem();