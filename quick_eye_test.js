// Quick EYE test to verify anchor point effectiveness

// Updated EYE anchor points with smooth progression
const BB_S_CURVE_EYE_ANCHORS = [
    [0, 0.035],     // 極低水平
    [30, 0.048],    // 低水平
    [40, 0.062],    // PR1基準: 產生 OBP 0.280
    [60, 0.075],    // 中等水平
    [70, 0.085],    // PR50基準: 產生 OBP 0.320 ✅
    [80, 0.095],    // 平滑過渡
    [85, 0.105],    // 平滑過渡
    [90, 0.115],    // 平滑過渡
    [95, 0.125],    // 平滑過渡
    [100, 0.140],   // PR99基準: 調整以產生 OBP 0.420 (平滑化)
    [110, 0.150],   // 平滑遞增
    [120, 0.160],   // 平滑遞增
    [130, 0.170],   // 平滑遞增
    [140, 0.180],   // 平滑遞增
    [150, 0.190]    // 平滑遞增
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

console.log('👁️ Quick EYE BB Rate Test');
console.log('Testing anchor points for problematic progression:\n');

const testPoints = [85, 90, 95, 99, 100, 105, 110, 115];
testPoints.forEach(eye => {
    const bbRate = interpolateFromAnchors(eye, BB_S_CURVE_EYE_ANCHORS);
    console.log(`EYE ${eye}: BB Rate ${bbRate.toFixed(3)}`);
});

console.log('\n🚨 Problem Analysis:');
const eye99 = interpolateFromAnchors(99, BB_S_CURVE_EYE_ANCHORS);
const eye100 = interpolateFromAnchors(100, BB_S_CURVE_EYE_ANCHORS);
const jump = eye100 - eye99;
console.log(`EYE 99→100 jump: ${eye99.toFixed(3)} → ${eye100.toFixed(3)} (+${jump.toFixed(3)})`);
console.log(`This is an artificial ${(jump * 1000).toFixed(0)} point increase in just 1 EYE point!`);

console.log('\n📊 Expected progression check:');
const benchmarkPoints = [40, 70, 100];
benchmarkPoints.forEach(eye => {
    const bbRate = interpolateFromAnchors(eye, BB_S_CURVE_EYE_ANCHORS);
    const expectedOBP = eye === 40 ? '0.280' : eye === 70 ? '0.320' : '0.420';
    console.log(`EYE ${eye}: BB Rate ${bbRate.toFixed(3)} → Expected OBP ${expectedOBP}`);
});