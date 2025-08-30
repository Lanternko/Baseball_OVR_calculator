// simulation-engine.js - 模擬引擎 (更新為新系統)

// 模擬單一賽季 - 新6種結果系統
function simulateSeason(numPA, probabilities) {
    const outcomes = {HR: 0, '2B': 0, '1B': 0, BB: 0, K: 0, OUT: 0, H: 0, AB: 0, PA: 0};
    const eventOrder = ['BB', 'HR', '2B', '1B', 'K', 'OUT']; // BB優先檢查
    
    for (let i = 0; i < numPA; i++) {
        outcomes.PA += 1;
        const randVal = Math.random();
        let cumulativeProb = 0.0;
        let chosenEvent = 'OUT'; // 默認出局
        
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

// 計算模擬統計數據 - 新系統版本
function calculateSimStats(simResults) {
    const stats = {};
    const ab = simResults.AB || 0;
    const h = simResults.H || 0;
    const bb = simResults.BB || 0;
    const pa = simResults.PA || 0;
    const k = simResults.K || 0;
    
    stats.BA = ab > 0 ? h / ab : 0;
    stats.OBP = pa > 0 ? (h + bb) / pa : 0; // 移除HBP
    
    const tb = (simResults['1B'] || 0) * 1 + (simResults['2B'] || 0) * 2 + (simResults.HR || 0) * 4;
    stats.SLG = ab > 0 ? tb / ab : 0;
    stats.OPS = stats.OBP + stats.SLG;
    stats.K_rate = pa > 0 ? k / pa : 0;
    stats.BB_rate = pa > 0 ? bb / pa : 0;
    
    // 計數統計
    stats.HR_count = simResults.HR || 0;
    stats.doubles_count = simResults['2B'] || 0;
    stats.triples_count = simResults['3B'] || 0; // In case triples are added later
    stats.singles_count = simResults['1B'] || 0;
    stats.BB_count = bb;
    stats.K_count = k;
    stats.H_count = h;
    stats.AB_count = ab;
    stats.PA_count = pa;
    
    return stats;
}

// 運行多個賽季的模擬 - 直接使用新模擬引擎
function simulatePlayerStats(pow, hit, eye, numSeasons = 10, paPerSeason = 600) {
    // 使用新的直接模擬方法 - 真正的多季平均
    if (typeof simulateMultipleAtBats !== 'undefined') {
        // 新系統可用 - 運行多個獨立賽季並平均
        let totalStats = {
            AVG: 0, OBP: 0, SLG: 0, OPS: 0,
            HR: 0, '2B': 0, '1B': 0, BB: 0, K: 0, H: 0, AB: 0, PA: 0
        };
        
        // 運行 numSeasons 個獨立賽季
        for (let season = 0; season < numSeasons; season++) {
            const results = simulateMultipleAtBats(eye, hit, pow, paPerSeason);
            const stats = calculateStats(results, paPerSeason);
            const finalStats = finalizeStats(stats);
            
            // 累加各賽季統計
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
        
        // 計算平均 - 正確的除數
        console.log(`📊 模擬結果驗證 (${pow}/${hit}/${eye}):`);
        console.log(`🔢 總PA: ${totalStats.PA} (預期: ${numSeasons * paPerSeason})`);
        console.log(`⚾ 總HR: ${totalStats.HR} → 平均: ${(totalStats.HR / numSeasons).toFixed(1)}`);
        console.log(`📈 總2B: ${totalStats['2B']} → 平均: ${(totalStats['2B'] / numSeasons).toFixed(1)}`);
        console.log(`🎯 總H: ${totalStats.H} → 平均: ${(totalStats.H / numSeasons).toFixed(1)}`);
        console.log(`🚶 總BB: ${totalStats.BB} → 平均: ${(totalStats.BB / numSeasons).toFixed(1)}`);
        console.log(`🧮 賽季數: ${numSeasons}, 每季PA: ${paPerSeason}`);
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
        // 回退到舊系統 (如果新函數不可用)
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

// 模塊導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    simulateSeason,
    calculateSimStats,
    simulatePlayerStats
  };
  
  // Node.js 環境下也設置全域變數
  global.simulateSeason = simulateSeason;
  global.calculateSimStats = calculateSimStats;
  global.simulatePlayerStats = simulatePlayerStats;
}