// Quick HIT test to verify anchor point effectiveness

// Current HIT anchor points from constants.js
const BABIP_S_CURVE_HIT_ANCHORS = [
    [0, 0.215],     // 極低水平
    [30, 0.240],    // 低水平
    [40, 0.255],    // PR1基準: 微調產生 BA 0.210
    [60, 0.275],    // 中等水平
    [70, 0.287],    // PR50基準: 微調產生 BA 0.250
    [80, 0.295],    // 平滑過渡
    [85, 0.300],    // 平滑過渡
    [90, 0.307],    // 平滑過渡
    [95, 0.315],    // 平滑過渡
    [100, 0.335],   // PR99基準: 產生 BA 0.320 (調整至 0.335)
    [110, 0.345],   // 平滑遞增
    [120, 0.355],   // 平滑遞增
    [130, 0.365],   // 平滑遞增
    [140, 0.375],   // 平滑遞增
    [150, 0.385]    // 平滑遞增
];

// Simple interpolation function
function interpolateFromAnchors(value, anchors) {
    for (let i = 0; i < anchors.length - 1; i++) {
        const [x1, y1] = anchors[i];
        const [x2, y2] = anchors[i + 1];
        
        if (value >= x1 && value <= x2) {
            const ratio = (value - x1) / (x2 - x1);
            return y1 + ratio * (y2 - y1);
        }
    }
    
    // Handle edge cases
    if (value <= anchors[0][0]) return anchors[0][1];
    if (value >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
}

console.log('🎯 Quick HIT BABIP Test');
console.log('Testing new anchor points for smooth progression:\n');

const testPoints = [85, 90, 95, 100, 105, 110, 120];
testPoints.forEach(hit => {
    const babip = interpolateFromAnchors(hit, BABIP_S_CURVE_HIT_ANCHORS);
    console.log(`HIT ${hit}: BABIP ${babip.toFixed(3)}`);
});

console.log('\n📊 Expected progression check:');
const benchmarkPoints = [40, 70, 100];
benchmarkPoints.forEach(hit => {
    const babip = interpolateFromAnchors(hit, BABIP_S_CURVE_HIT_ANCHORS);
    const expectedBA = hit === 40 ? '0.210' : hit === 70 ? '0.250' : '0.320';
    console.log(`HIT ${hit}: BABIP ${babip.toFixed(3)} → Expected BA ${expectedBA}`);
});