// ovr-calculator.js - 修正版完整 OVR 計算器

// 🔥 平滑轉換函數（修正版）
function getAttributeScoreSmooth(metricVal, pr1Benchmark, pr50Benchmark, pr99Benchmark, statType) {
    const pr1_map = 40;
    const pr50_map = 70; 
    const pr99_map = 99;
    
    // 🔧 安全檢查：確保輸入有效
    if (metricVal === null || metricVal === undefined || isNaN(metricVal)) {
        console.error('getAttributeScoreSmooth: 無效輸入', metricVal);
        return 1; // 返回最小值而不是 0，避免計算問題
    }
    
    // 定義理論極限值
    let theoreticalMin, theoreticalMax;
    if (statType === 'SLG') {
        theoreticalMin = 0.0;
        theoreticalMax = 4.0;
    } else if (statType === 'BA') {
        theoreticalMin = 0.0;
        theoreticalMax = 1.0;
    } else { // OBA
        theoreticalMin = 0.0;
        theoreticalMax = 1.0;
    }
    
    let score = 0;
    
    // 階段 1: 理論最低 → PR1
    if (metricVal <= pr1Benchmark) {
        if (metricVal <= theoreticalMin) {
            score = 1; // 🔧 最小值設為 1 而不是 0，避免幾何平均問題
        } else {
            // 平滑從 1 到 40
            score = 1 + (pr1_map - 1) * (metricVal - theoreticalMin) / (pr1Benchmark - theoreticalMin);
        }
    }
    // 階段 2: PR1 → PR50
    else if (metricVal <= pr50Benchmark) {
        score = pr1_map + (pr50_map - pr1_map) * (metricVal - pr1Benchmark) / (pr50Benchmark - pr1Benchmark);
    }
    // 階段 3: PR50 → PR99
    else if (metricVal <= pr99Benchmark) {
        score = pr50_map + (pr99_map - pr50_map) * (metricVal - pr50Benchmark) / (pr99Benchmark - pr50Benchmark);
    }
    // 階段 4: PR99 → 理論最高
    else {
        if (metricVal >= theoreticalMax) {
            score = 500;
        } else {
            const remainingRange = theoreticalMax - pr99Benchmark;
            if (remainingRange > 0) {
                const progressBeyondPr99 = (metricVal - pr99Benchmark) / remainingRange;
                score = pr99_map + (500 - pr99_map) * Math.sqrt(Math.max(0, progressBeyondPr99));
            } else {
                score = pr99_map;
            }
        }
    }
    
    // 🔧 確保返回有效數值，但不強制取整
    const result = Math.max(1, Math.min(500, score));
    return isNaN(result) ? 1 : result;
}

// 🔧 修正版數據轉三圍函數
function calculatePlayerGameAttributes(xBA, xSLG, xwOBA) {
    // 🔧 輸入驗證和預處理
    const safeXBA = parseFloat(xBA) || 0;
    const safeXSLG = parseFloat(xSLG) || 0;
    const safeXwOBA = parseFloat(xwOBA) || 0;
    
    console.log('輸入數據:', { xBA: safeXBA, xSLG: safeXSLG, xwOBA: safeXwOBA });
    
    const powScore = getAttributeScoreSmooth(safeXSLG, LEAGUE_BENCHMARKS['xSLG']['pr1'], LEAGUE_BENCHMARKS['xSLG']['pr50'], LEAGUE_BENCHMARKS['xSLG']['pr99'], 'SLG');
    const hitScore = getAttributeScoreSmooth(safeXBA, LEAGUE_BENCHMARKS['xBA']['pr1'], LEAGUE_BENCHMARKS['xBA']['pr50'], LEAGUE_BENCHMARKS['xBA']['pr99'], 'BA');
    const eyeScore = getAttributeScoreSmooth(safeXwOBA, LEAGUE_BENCHMARKS['xwOBA']['pr1'], LEAGUE_BENCHMARKS['xwOBA']['pr50'], LEAGUE_BENCHMARKS['xwOBA']['pr99'], 'OBA');
    
    console.log('轉換結果:', { POW: powScore, HIT: hitScore, EYE: eyeScore });
    
    return {
        POW: powScore, // 🔧 不要強制取整，保留小數
        HIT: hitScore,
        EYE: eyeScore
    };
}

// 🔧 修正版 OVR 計算函數（加強錯誤處理）
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
    if (ovr >= 95) return "聯盟前10% 🔥";
    if (ovr >= 88) return "可靠主力 ⭐";
    if (ovr >= 70) return "平均先發 📈";
    if (ovr >= 40) return "大聯盟替補 ⚾";
    if (ovr >= 20) return "小聯盟水準 📉";
    return "業餘愛好者 🍨";
}

// 🎯 均衡度描述函數
function getBalanceDescription(ratio) {
    if (ratio >= 0.95) return "(完美均衡)";
    if (ratio >= 0.85) return "(優秀均衡)";
    if (ratio >= 0.70) return "(良好均衡)";
    if (ratio >= 0.55) return "(略有偏科)";
    return "(明顯偏科)";
}

// 🔧 修正版 OVR 分解顯示
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