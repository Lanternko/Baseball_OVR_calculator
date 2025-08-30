@ -0,0 +1,42 @@
// Test full 100/100/100 combination and extreme cases
const fs = require('fs');

// Load all required files
eval(fs.readFileSync('constants.js', 'utf8'));
eval(fs.readFileSync('probability_model.js', 'utf8'));
eval(fs.readFileSync('simulation_engine.js', 'utf8'));

console.log('🎯 Full Elite Combination Testing');
console.log('Testing 100/100/100 and extreme cases\n');

const testCases = [
    // Core benchmarks
    {pow: 100, hit: 100, eye: 100, desc: '100/100/100 (Target: .320 BA)'},
    
    // Individual elite skills
    {pow: 100, hit: 70, eye: 70, desc: '100/70/70 POW Elite'},
    {pow: 70, hit: 100, eye: 70, desc: '70/100/70 HIT Elite'}, 
    {pow: 70, hit: 70, eye: 100, desc: '70/70/100 EYE Elite'},
    
    // Extreme cases
    {pow: 120, hit: 120, eye: 120, desc: '120/120/120 (Extreme)'},
    {pow: 70, hit: 140, eye: 70, desc: '70/140/70 (HIT God Mode)'},
    {pow: 140, hit: 70, eye: 70, desc: '140/70/70 (POW God Mode)'},
    {pow: 70, hit: 70, eye: 140, desc: '70/70/140 (EYE God Mode)'}
];

testCases.forEach(test => {
    const stats = simulatePlayerStats(test.pow, test.hit, test.eye, 300, 600);
    
    console.log(`${test.desc}:`);
    console.log(`  BA: ${stats.BA.toFixed(3)}, OBP: ${stats.OBP.toFixed(3)}, SLG: ${stats.SLG.toFixed(3)}`);
    console.log(`  HR: ${Math.round(stats.HR_count)}, BB: ${Math.round(stats.BB_count)}, K: ${Math.round(stats.K_count)}`);
    console.log('');
});

console.log('🚨 Extreme BA Analysis:');
[130, 140, 150].forEach(hit => {
    const stats = simulatePlayerStats(70, hit, 70, 300, 600);
    const warning = stats.BA > 0.370 ? ' ⚠️ UNREALISTIC' : stats.BA > 0.350 ? ' 🔥 LEGENDARY' : ' ✅ OK';
    console.log(`HIT ${hit}/70/70: BA ${stats.BA.toFixed(3)}${warning}`);
});