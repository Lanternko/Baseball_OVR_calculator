// Quick test to analyze current performance vs targets
const fs = require('fs');
const path = require('path');

// Load the required files
const constantsFile = fs.readFileSync(path.join(__dirname, 'constants.js'), 'utf8');
const probabilityFile = fs.readFileSync(path.join(__dirname, 'probability_model.js'), 'utf8');
const simulationFile = fs.readFileSync(path.join(__dirname, 'simulation_engine.js'), 'utf8');

// Execute the code
eval(constantsFile);
eval(probabilityFile);
eval(simulationFile);

// Define targets
const targets = {
    40: {BA: 0.210, OBP: 0.280, SLG: 0.320, OPS: 0.600, HR: 15, XBH: 45},
    70: {BA: 0.250, OBP: 0.320, SLG: 0.420, OPS: 0.740, HR: 25, XBH: 65},
    100: {BA: 0.320, OBP: 0.420, SLG: 0.570, OPS: 0.990, HR: 40, XBH: 78},
    120: {BA: 0.340, OBP: 0.470, SLG: 0.720, OPS: 1.190, HR: 55, XBH: 85},
    150: {BA: 0.380, OBP: 0.570, SLG: 0.900, OPS: 1.470, HR: 75, XBH: 110}
};

console.log('🎯 Current Performance vs Target Analysis\n');
console.log('Level | Stat | Target  | Current | Gap     | Status');
console.log('------|------|---------|---------|---------|--------');

const testLevels = [40, 70, 100, 120, 150];

for (let level of testLevels) {
    console.log(`\n📊 Level ${level} (${level}/${level}/${level}):`);
    
    try {
        const stats = simulatePlayerStats(level, level, level, 10, 600); // Use 10 simulations for speed
        
        // Create compatible format
        const compatStats = {
            BA: stats.BA,
            OBP: stats.OBP,
            SLG: stats.SLG,
            OPS: stats.OPS,
            HR: stats.HR_count,
            XBH: (stats.HR_count + stats.doubles_count)
        };
        const target = targets[level];
        
        const testStats = [
            {name: 'BA', target: target.BA, current: compatStats.BA},
            {name: 'OBP', target: target.OBP, current: compatStats.OBP},
            {name: 'SLG', target: target.SLG, current: compatStats.SLG},
            {name: 'HR', target: target.HR, current: compatStats.HR},
            {name: 'XBH', target: target.XBH, current: compatStats.XBH}
        ];
        
        for (let stat of testStats) {
            const gap = stat.current - stat.target;
            const gapPct = Math.abs(gap / stat.target * 100);
            let status = '✅ Good';
            
            if (gapPct > 15) {
                status = '❌ Far';
            } else if (gapPct > 10) {
                status = '⚠️ Off';
            } else if (gapPct > 5) {
                status = '🔄 Close';
            }
            
            console.log(`${level.toString().padEnd(5)} | ${stat.name.padEnd(4)} | ${stat.target.toFixed(3).padEnd(7)} | ${stat.current.toFixed(3).padEnd(7)} | ${(gap > 0 ? '+' : '') + gap.toFixed(3).padEnd(6)} | ${status}`);
        }
        
    } catch (error) {
        console.log(`❌ Error testing level ${level}:`, error.message);
    }
}

console.log('\n🔍 Priority Issues to Address:');
console.log('1. Check if any stats are significantly off target (>15% gap)');
console.log('2. Look for systematic patterns in gaps');
console.log('3. Identify which curves need adjustment');