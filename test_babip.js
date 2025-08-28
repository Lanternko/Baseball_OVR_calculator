// Test BABIP curve - Node.js compatible
const fs = require('fs');

// Load constants
eval(fs.readFileSync('constants.js', 'utf8'));

// BABIP interpolation function
function interpolateSCurve(value, anchors) {
    if (!anchors || !anchors.length) return 0.0;
    if (value <= anchors[0][0]) return anchors[0][1];
    if (value >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
    
    for (let i = 0; i < anchors.length - 1; i++) {
        const [x1, y1] = anchors[i];
        const [x2, y2] = anchors[i + 1];
        if (x1 <= value && value < x2) {
            return (x2 - x1) ? y1 + (y2 - y1) * (value - x1) / (x2 - x1) : y1;
        }
    }
    return anchors[anchors.length - 1][1];
}

console.log('🔍 當前HIT-BABIP曲線分析:');
console.log('HIT值 -> BABIP (理想BABIP約.330以達成.310 BA)');

// 確認變量存在
if (typeof BABIP_S_CURVE_HIT_ANCHORS !== 'undefined') {
    console.log('BABIP曲線數據:', BABIP_S_CURVE_HIT_ANCHORS.slice(0, 3));
    
    for(let hit = 70; hit <= 100; hit += 5) {
        const babip = interpolateSCurve(hit, BABIP_S_CURVE_HIT_ANCHORS);
        const ideal = babip >= 0.330 ? '✅' : '❌';
        console.log(`HIT ${hit}: BABIP ${babip.toFixed(3)} ${ideal}`);
    }
} else {
    console.error('❌ BABIP_S_CURVE_HIT_ANCHORS 未定義');
}

console.log('\n🎯 問題分析:');
console.log('- 要達成.310 BA (考慮20% K率)，需要BABIP約.330');
console.log('- 目前HIT 85對應BABIP .320，略低');
console.log('- 建議微調BABIP曲線提升5-10點');