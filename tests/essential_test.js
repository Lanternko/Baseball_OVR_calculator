// Essential test - Focus on BA, OBP, HR within 3% of targets
console.log('🎯 Essential Test - BA/OBP/HR Target Validation');

// Load constants and probability model
const constants = require('./constants.js');
const model = require('./probability_model.js');

// Target values (user specified)
const TARGETS = {
    40: { BA: 0.210, OBP: 0.280, HR: 4 },
    70: { BA: 0.260, OBP: 0.330, HR: 21 }, 
    100: { BA: 0.320, OBP: 0.420, HR: 45 },
    120: { BA: 0.350, OBP: 0.470, HR: 55 },
    150: { BA: 0.400, OBP: 0.570, HR: 70 }
};

// Test function
function runEssentialTest() {
    console.log('\nLevel | Stat | Target  | Current | Gap     | %Gap | Status');
    console.log('------|------|---------|---------|---------|------|--------');
    
    const testLevels = [40, 70, 100, 120, 150];
    let allWithin3Percent = true;
    
    for (let level of testLevels) {
        const results = model.simulateMultipleAtBats(level, level, level, 10000);
        const stats = model.calculateStats(results, 10000);
        const finalStats = model.finalizeStats(stats);
        
        const target = TARGETS[level];
        
        // Test BA, OBP, HR
        const tests = [
            { name: 'BA', target: target.BA, current: finalStats.AVG },
            { name: 'OBP', target: target.OBP, current: finalStats.OBP },
            { name: 'HR', target: target.HR, current: finalStats.HR }
        ];
        
        for (let test of tests) {
            const gap = test.current - test.target;
            const gapPct = Math.abs(gap / test.target * 100);
            
            let status;
            if (gapPct <= 3.0) {
                status = '✅ PASS';
            } else if (gapPct <= 5.0) {
                status = '🔄 CLOSE';
                allWithin3Percent = false;
            } else if (gapPct <= 10.0) {
                status = '⚠️ OFF';
                allWithin3Percent = false;
            } else {
                status = '❌ FAR';
                allWithin3Percent = false;
            }
            
            console.log(`${level.toString().padEnd(5)} | ${test.name.padEnd(4)} | ${test.target.toFixed(3).padEnd(7)} | ${test.current.toFixed(3).padEnd(7)} | ${(gap > 0 ? '+' : '') + gap.toFixed(3).padEnd(6)} | ${gapPct.toFixed(1).padEnd(4)}% | ${status}`);
        }
    }
    
    // Check monotonicity
    console.log('\n🔍 Monotonicity Check:');
    const ba40 = model.finalizeStats(model.calculateStats(model.simulateMultipleAtBats(40, 40, 40, 10000), 10000)).AVG;
    const ba70 = model.finalizeStats(model.calculateStats(model.simulateMultipleAtBats(70, 70, 70, 10000), 10000)).AVG;
    const ba100 = model.finalizeStats(model.calculateStats(model.simulateMultipleAtBats(100, 100, 100, 10000), 10000)).AVG;
    const ba120 = model.finalizeStats(model.calculateStats(model.simulateMultipleAtBats(120, 120, 120, 10000), 10000)).AVG;
    const ba150 = model.finalizeStats(model.calculateStats(model.simulateMultipleAtBats(150, 150, 150, 10000), 10000)).AVG;
    
    const monotonic = ba40 < ba70 && ba70 < ba100 && ba100 < ba120 && ba120 < ba150;
    console.log(`BA Progression: ${ba40.toFixed(3)} < ${ba70.toFixed(3)} < ${ba100.toFixed(3)} < ${ba120.toFixed(3)} < ${ba150.toFixed(3)}`);
    console.log(`Monotonic: ${monotonic ? '✅ YES' : '❌ NO'}`);
    
    // Summary
    console.log(`\n🎯 Result: ${allWithin3Percent ? '✅ ALL WITHIN 3%' : '❌ NEEDS TUNING'}`);
    
    return allWithin3Percent;
}

// Run the test
runEssentialTest();