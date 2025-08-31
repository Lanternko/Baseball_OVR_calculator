// Analyze current vs realistic benchmarks
console.log('🔍 分析當前基準點問題');

// Current anchors in reverse_engineer.js
const currentAnchors = {
    BA: [[0.225, 40], [0.284, 70], [0.343, 100], [0.381, 120], [0.431, 150]],
    SLG: [[0.313, 40], [0.464, 70], [0.625, 100], [0.713, 120], [0.884, 150]], 
    wOBA: [[0.264, 40], [0.347, 70], [0.455, 100], [0.504, 120], [0.584, 150]]
};

// Test real player cases
const testCases = [
    {name: 'Ohtani 2024', BA: 0.310, SLG: 0.646, wOBA: 0.390},
    {name: 'Judge 2024', BA: 0.322, SLG: 0.701, wOBA: 0.458},
    {name: 'League Average', BA: 0.248, SLG: 0.395, wOBA: 0.315}
];

function interpolate(value, anchors) {
    if (value <= anchors[0][0]) return anchors[0][1];
    if (value >= anchors[anchors.length-1][0]) return anchors[anchors.length-1][1];
    
    for (let i = 0; i < anchors.length - 1; i++) {
        const [x1, y1] = anchors[i];
        const [x2, y2] = anchors[i + 1];
        
        if (value >= x1 && value <= x2) {
            return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
        }
    }
    return anchors[0][1];
}

console.log('\n🎯 Current Anchor Analysis:');
testCases.forEach(player => {
    const hit = interpolate(player.BA, currentAnchors.BA);
    const pow = interpolate(player.SLG, currentAnchors.SLG);  
    const eye = interpolate(player.wOBA, currentAnchors.wOBA);
    
    console.log(`\n${player.name}:`);
    console.log(`  Stats: BA=${player.BA}, SLG=${player.SLG}, wOBA=${player.wOBA}`);
    console.log(`  Attributes: HIT=${hit.toFixed(1)}, POW=${pow.toFixed(1)}, EYE=${eye.toFixed(1)}`);
    console.log(`  Issues: ${pow > 150 ? '⚠️ POW exceeds human limit' : pow > 130 ? '🔸 POW very high' : '✅ POW reasonable'}`);
});

// Suggest revised anchors based on actual MLB distributions
console.log('\n💡 建議修正的錨點:');

// More realistic SLG anchors (key issue)
const revisedSLG = [[0.313, 40], [0.464, 70], [0.570, 100], [0.650, 120], [0.750, 150]];
console.log('SLG修正: 100等級從0.625→0.570, 120等級從0.713→0.650');

// Test revised anchors
console.log('\n🧪 修正後結果:');
testCases.forEach(player => {
    const hit = interpolate(player.BA, currentAnchors.BA);
    const pow = interpolate(player.SLG, revisedSLG);  
    const eye = interpolate(player.wOBA, currentAnchors.wOBA);
    
    console.log(`${player.name}: HIT=${hit.toFixed(1)}, POW=${pow.toFixed(1)}, EYE=${eye.toFixed(1)}`);
});

console.log('\n📊 問題分析:');
console.log('1. SLG錨點過於保守 - 0.646 SLG不應該需要143 POW');
console.log('2. 真實精英球員(Ohtani/Judge)的SLG在0.65-0.70範圍');
console.log('3. 建議100等級對應0.570 SLG，120等級對應0.650 SLG');
console.log('4. 這樣更符合現實MLB數據分佈');