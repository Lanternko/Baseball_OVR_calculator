// simulation-engine.js - 模擬引擎 (本檔案負責核心模擬邏輯)

// 模擬單一賽季 - 根據給定的機率執行模擬
function simulateSeason(numPA, probabilities) {
    const outcomes = { HR: 0, '2B': 0, '1B': 0, BB: 0, K: 0, OUT: 0, H: 0, AB: 0, PA: 0 };
    const eventOrder = ['BB', 'HR', '2B', '1B', 'K', 'OUT']; // 按照事件優先順序處理

    for (let i = 0; i < numPA; i++) {
        outcomes.PA += 1;
        const randVal = Math.random();
        let cumulativeProb = 0.0;
        let chosenEvent = 'OUT'; // 預設結果為出局

        for (const eventType of eventOrder) {
            const prob = probabilities[eventType] || 0;
            cumulativeProb += prob;
            if (randVal < cumulativeProb) {
                chosenEvent = eventType;
                break;
            }
        }

        outcomes[chosenEvent] += 1;

        if (['HR', '2B', '1B'].includes(chosenEvent)) {
            outcomes.H += 1;
            outcomes.AB += 1;
        } else if (['K', 'OUT'].includes(chosenEvent)) {
            outcomes.AB += 1;
        }
        // BB 不計入 AB
    }
    return outcomes;
}

// 計算模擬結果的統計數據 - 從事件次數計算平均值
function calculateSimStats(simResults) {
    const stats = {};
    const ab = simResults.AB || 0;
    const h = simResults.H || 0;
    const bb = simResults.BB || 0;
    const pa = simResults.PA || 0;
    const k = simResults.K || 0;

    stats.BA = ab > 0 ? h / ab : 0;
    stats.OBP = pa > 0 ? (h + bb) / pa : 0; // 暫不考慮觸身球(HBP)

    const tb = (simResults['1B'] || 0) * 1 + (simResults['2B'] || 0) * 2 + (simResults.HR || 0) * 4;
    stats.SLG = ab > 0 ? tb / ab : 0;
    stats.OPS = stats.OBP + stats.SLG;
    stats.K_rate = pa > 0 ? k / pa : 0;
    stats.BB_rate = pa > 0 ? bb / pa : 0;

    // 原始數據結果
    stats.HR_count = simResults.HR || 0;
    stats.doubles_count = simResults['2B'] || 0;
    stats.triples_count = simResults['3B'] || 0; // 以防未來加入三壘安打
    stats.singles_count = simResults['1B'] || 0;
    stats.BB_count = bb;
    stats.K_count = k;
    stats.H_count = h;
    stats.AB_count = ab;
    stats.PA_count = pa;

    return stats;
}

// 執行多次賽季模擬 - 為了得到更穩定的數據
function simulatePlayerStats(pow, hit, eye, numSeasons = 10, paPerSeason = 600) {
    // 檢查是否有新的模擬模型 - 用於未來擴充
    if (typeof simulateMultipleAtBats !== 'undefined') {
        // 如果有新模型，使用新模型
        let totalStats = {
            AVG: 0, OBP: 0, SLG: 0, OPS: 0,
            HR: 0, '2B': 0, '1B': 0, BB: 0, K: 0, H: 0, AB: 0, PA: 0
        };

        // 執行 numSeasons 次模擬
        for (let season = 0; season < numSeasons; season++) {
            const results = simulateMultipleAtBats(eye, hit, pow, paPerSeason);
            const stats = NEW_PROBABILITY_MODEL.calculateStats(results, paPerSeason);
            const finalStats = NEW_PROBABILITY_MODEL.finalizeStats(stats);

            // 累計每個賽季的數據
            totalStats.AVG += finalStats.AVG;
            totalStats.OBP += finalStats.OBP;
            totalStats.SLG += finalStats.SLG;
            totalStats.OPS += finalStats.OPS;
            totalStats.HR += finalStats.HR;
            totalStats['2B'] += finalStats['2B'];
            totalStats['1B'] += finalStats['1B'];
            totalStats.BB += finalStats.BB;
            totalStats.K += finalStats.K;
            totalStats.H += finalStats.H;
            totalStats.AB += finalStats.AB;
            totalStats.PA += finalStats.PA;
        }

        // 計算平均數據
        console.log(`⚾️ 模擬結果總結 (${pow}/${hit}/${eye}):`);
        console.log(`✅ 總打席: ${totalStats.PA} (預計: ${numSeasons * paPerSeason})`);
        console.log(`💥 總HR: ${totalStats.HR} | 平均: ${(totalStats.HR / numSeasons).toFixed(1)}`);
        console.log(`🚀 總2B: ${totalStats['2B']} | 平均: ${(totalStats['2B'] / numSeasons).toFixed(1)}`);
        console.log(`📊 總XBH: ${totalStats.HR + totalStats['2B']} | 平均: ${((totalStats.HR + totalStats['2B']) / numSeasons).toFixed(1)}`);
        console.log(`📈 總H: ${totalStats.H} | 平均: ${(totalStats.H / numSeasons).toFixed(1)}`);
        console.log(`🚶‍♂️ 總BB: ${totalStats.BB} | 平均: ${(totalStats.BB / numSeasons).toFixed(1)}`);
        console.log(`ℹ️ 模擬次數: ${numSeasons}, 每季PA: ${paPerSeason}`);
        console.log(`---`);

        return {
            BA: totalStats.AVG / numSeasons,
            OBP: totalStats.OBP / numSeasons,
            SLG: totalStats.SLG / numSeasons,
            OPS: totalStats.OPS / numSeasons,
            HR_count: totalStats.HR / numSeasons,
            doubles_count: totalStats['2B'] / numSeasons,
            singles_count: totalStats['1B'] / numSeasons,
            BB_count: totalStats.BB / numSeasons,
            K_count: totalStats.K / numSeasons,
            H_count: totalStats.H / numSeasons,
            AB_count: totalStats.AB / numSeasons,
            PA_count: totalStats.PA / numSeasons
        };
    } else {
        // 如果沒有新模型，使用舊模型 (簡單機率模型)
        const probs = getPAEventProbabilities(pow, hit, eye);

        let totalStats = {
            HR: 0, '2B': 0, '1B': 0, BB: 0, K: 0, OUT: 0,
            H: 0, AB: 0, PA: 0
        };

        for (let season = 0; season < numSeasons; season++) {
            const seasonResult = simulateSeason(paPerSeason, probs);
            Object.keys(totalStats).forEach(key => {
                totalStats[key] += seasonResult[key] || 0;
            });
        }

        // 計算平均數據
        const avgStats = calculateSimStats({
            HR: totalStats.HR / numSeasons,
            '2B': totalStats['2B'] / numSeasons,
            '1B': totalStats['1B'] / numSeasons,
            BB: totalStats.BB / numSeasons,
            K: totalStats.K / numSeasons,
            OUT: totalStats.OUT / numSeasons,
            H: totalStats.H / numSeasons,
            AB: totalStats.AB / numSeasons,
            PA: totalStats.PA / numSeasons
        });

        return avgStats;
    }
}

// 模組匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        simulateSeason,
        calculateSimStats,
        simulatePlayerStats,
        simulateBatterVsPitcher
    };

    // Node.js 環境下將函式暴露到全域
    global.simulateSeason = simulateSeason;
    global.calculateSimStats = calculateSimStats;
    global.simulatePlayerStats = simulatePlayerStats;
    global.simulateBatterVsPitcher = simulateBatterVsPitcher;

    // 打者 vs 投手：使用融合機率
    function simulateBatterVsPitcher(pow, hit, eye, pitcherAttrs, numSeasons = 10, paPerSeason = 600) {
        const getProbs = (typeof getPAEventProbabilitiesVsPitcher !== 'undefined') ? getPAEventProbabilitiesVsPitcher : null;
        if (!getProbs) {
            console.warn('getPAEventProbabilitiesVsPitcher 未載入，改用打者單邊模擬');
            return simulatePlayerStats(pow, hit, eye, numSeasons, paPerSeason);
        }

        let totalStats = { HR: 0, '2B': 0, '1B': 0, BB: 0, K: 0, OUT: 0, H: 0, AB: 0, PA: 0 };
        for (let season = 0; season < numSeasons; season++) {
            const probs = getProbs(pow, hit, eye, pitcherAttrs);
            const seasonResult = simulateSeason(paPerSeason, probs);
            Object.keys(totalStats).forEach(key => {
                totalStats[key] += seasonResult[key] || 0;
            });
        }
        const avgStats = calculateSimStats({
            HR: totalStats.HR / numSeasons,
            '2B': totalStats['2B'] / numSeasons,
            '1B': totalStats['1B'] / numSeasons,
            BB: totalStats.BB / numSeasons,
            K: totalStats.K / numSeasons,
            OUT: totalStats.OUT / numSeasons,
            H: totalStats.H / numSeasons,
            AB: totalStats.AB / numSeasons,
            PA: totalStats.PA / numSeasons
        });
        return avgStats;
    }

    // 瀏覽器環境：導出新函式（保持與現有相容）
    if (typeof window !== 'undefined') {
        window.simulateSeason = window.simulateSeason || simulateSeason;
        window.calculateSimStats = window.calculateSimStats || calculateSimStats;
        window.simulatePlayerStats = window.simulatePlayerStats || simulatePlayerStats;
        window.simulateBatterVsPitcher = simulateBatterVsPitcher;
    }
}