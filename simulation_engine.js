// simulation-engine.js - 模擬引擎

// 模擬單一賽季
function simulateSeason(numPA, probabilities) {
    const outcomes = {HR: 0, '2B': 0, '1B': 0, BB: 0, HBP: 0, K: 0, IPO: 0, H: 0, AB: 0, PA: 0, OUT: 0};
    const eventOrder = ['HR', '2B', '1B', 'BB', 'HBP', 'K', 'IPO'];
    
    for (let i = 0; i < numPA; i++) {
        outcomes.PA += 1;
        const randVal = Math.random();
        let cumulativeProb = 0.0;
        let chosenEvent = 'IPO';
        
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
        } else if (['K', 'IPO'].includes(chosenEvent)) {
            outcomes.OUT += 1;
            outcomes.AB += 1;
        }
        // BB 和 HBP 不計入 AB
    }
    return outcomes;
}

// 計算模擬統計數據
function calculateSimStats(simResults) {
    const stats = {};
    const ab = simResults.AB || 0;
    const h = simResults.H || 0;
    const bb = simResults.BB || 0;
    const hbp = simResults.HBP || 0;
    const pa = simResults.PA || 0;
    const k = simResults.K || 0;
    
    stats.BA = ab > 0 ? h / ab : 0;
    stats.OBP = pa > 0 ? (h + bb + hbp) / pa : 0;
    
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

// 運行多個賽季的模擬
function simulatePlayerStats(pow, hit, eye, numSeasons = NUM_SIMULATIONS, paPerSeason = 600) {
    // 獲取事件概率
    const probs = getPAEventProbabilities(pow, hit, eye);
    
    let totalStats = {
        HR: 0, '2B': 0, '1B': 0, BB: 0, HBP: 0, K: 0, IPO: 0,
        H: 0, AB: 0, PA: 0, OUT: 0
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
        HBP: totalStats.HBP / numSeasons,
        K: totalStats.K / numSeasons,
        IPO: totalStats.IPO / numSeasons,
        H: totalStats.H / numSeasons,
        AB: totalStats.AB / numSeasons,
        PA: totalStats.PA / numSeasons
    });
    
    return avgStats;
}