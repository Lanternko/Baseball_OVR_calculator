// 生成完整的 wOBA 等級對照表
const fs = require('fs');

// 簡化的模擬引擎（與真實模擬引擎邏輯一致）
function simulateLevel(level) {
    // 基礎能力轉換
    const hitRate = Math.min(0.45, level / 250);
    const walkRate = Math.min(0.20, level / 400);
    const powerFactor = level / 100;
    
    // 基本統計
    const pa = 600;
    const bb = Math.round(pa * walkRate);
    const ab = pa - bb;
    const hits = Math.round(ab * hitRate);
    
    // 長打分配
    const hrRate = Math.min(0.08, powerFactor * 0.06);
    const doublesRate = Math.min(0.06, powerFactor * 0.04);
    const triplesRate = 0.005; // 固定低值
    
    const homers = Math.round(ab * hrRate);
    const doubles = Math.round(hits * doublesRate * 3); // 增加二壘安打比例
    const triples = Math.round(hits * triplesRate);
    const singles = Math.max(0, hits - doubles - triples - homers);
    
    // 確保數據合理
    const actualHits = singles + doubles + triples + homers;
    
    return {
        AB: ab,
        BB: bb,
        H: actualHits,
        '1B': singles,
        '2B': doubles,
        '3B': triples,
        HR_count: homers,
        BA: ab > 0 ? actualHits / ab : 0,
        OBP: pa > 0 ? (actualHits + bb) / pa : 0,
        SLG: ab > 0 ? (singles + doubles * 2 + triples * 3 + homers * 4) / ab : 0
    };
}

// wOBA 計算
function calculateWOBA(stats) {
    const weights = {
        BB: 0.692,
        '1B': 0.879,
        '2B': 1.242,
        '3B': 1.568,
        HR: 2.081
    };
    
    const pa = stats.AB + stats.BB;
    if (pa === 0) return 0;
    
    const woba = (
        stats.BB * weights.BB +
        stats['1B'] * weights['1B'] +
        stats['2B'] * weights['2B'] +
        stats['3B'] * weights['3B'] +
        stats.HR_count * weights.HR
    ) / pa;
    
    return woba;
}

console.log('🎯 生成完整 wOBA 等級對照表');
console.log('='.repeat(80));

// 生成關鍵等級點
const keyLevels = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 200, 250, 300, 400, 500];
const mappingData = [];

console.log('等級\t分類\t\t\twOBA\tOPS\tBA\tOBP\tSLG\tHR');
console.log('='.repeat(80));

const categoryMap = {
    1: '最低',
    10: '邊緣',
    20: '業餘',
    30: '新手',
    40: '小聯盟',
    50: '小聯盟+',
    60: '替補',
    70: '聯盟平均',
    80: '優質先發',
    90: '可靠主力',
    100: '精英球員',
    110: '全明星',
    120: '名人堂',
    130: '超級巨星',
    140: '傳奇',
    150: '歷史最強',
    200: '神話級',
    250: '超神話',
    300: '理論級',
    400: '不可能級',
    500: '絕對極限'
};

keyLevels.forEach(level => {
    const stats = simulateLevel(level);
    const woba = calculateWOBA(stats);
    const ops = stats.OBP + stats.SLG;
    const category = categoryMap[level] || '';
    
    mappingData.push({
        level: level,
        category: category,
        woba: woba,
        ops: ops,
        ba: stats.BA,
        obp: stats.OBP,
        slg: stats.SLG,
        hr: stats.HR_count
    });
    
    console.log(
        `${level.toString().padEnd(3)}\t${category.padEnd(12)}\t${woba.toFixed(3)}\t${ops.toFixed(3)}\t${stats.BA.toFixed(3)}\t${stats.OBP.toFixed(3)}\t${stats.SLG.toFixed(3)}\t${stats.HR_count}`
    );
});

// 生成詳細每10級數據
console.log('\n📊 每10級詳細數據:');
console.log('Level\twOBA\tOPS\tBA\tOBP\tSLG');
console.log('='.repeat(40));

const detailedMapping = [];
for (let level = 10; level <= 200; level += 10) {
    const stats = simulateLevel(level);
    const woba = calculateWOBA(stats);
    const ops = stats.OBP + stats.SLG;
    
    detailedMapping.push({
        level: level,
        woba: woba,
        ops: ops,
        ba: stats.BA,
        obp: stats.OBP,
        slg: stats.SLG
    });
    
    console.log(`${level}\t${woba.toFixed(3)}\t${ops.toFixed(3)}\t${stats.BA.toFixed(3)}\t${stats.OBP.toFixed(3)}\t${stats.SLG.toFixed(3)}`);
}

// 關鍵錨點確認
console.log('\n🎯 關鍵錨點確認:');
const anchors = [10, 70, 100, 120, 150];
anchors.forEach(level => {
    const data = mappingData.find(d => d.level === level);
    if (data) {
        console.log(`Level ${level} (${data.category}): wOBA = ${data.woba.toFixed(3)}`);
    }
});

// 輸出 JavaScript 數組格式
console.log('\n💾 JavaScript 映射數組:');
console.log('const wobaLevelMapping = [');
mappingData.forEach((item, index) => {
    const comma = index < mappingData.length - 1 ? ',' : '';
    console.log(`  { level: ${item.level}, woba: ${item.woba.toFixed(4)}, category: "${item.category}" }${comma}`);
});
console.log('];');

// wOBA 增長分析
console.log('\n📈 wOBA 增長趨勢:');
const growthAnalysis = [40, 70, 100, 120, 150];
for (let i = 1; i < growthAnalysis.length; i++) {
    const current = mappingData.find(d => d.level === growthAnalysis[i]);
    const previous = mappingData.find(d => d.level === growthAnalysis[i-1]);
    const growth = current.woba - previous.woba;
    const levelDiff = growthAnalysis[i] - growthAnalysis[i-1];
    const avgGrowth = growth / levelDiff;
    
    console.log(`${growthAnalysis[i-1]} → ${growthAnalysis[i]}: +${growth.toFixed(4)} wOBA (+${(avgGrowth*1000).toFixed(2)}/1000 per level)`);
}

console.log('\n✅ wOBA 等級對照表生成完成');