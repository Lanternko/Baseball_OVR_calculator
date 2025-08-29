// Quick verification of our fixes
const fs = require('fs');
const path = require('path');

try {
    // Load the required files
    const constantsFile = fs.readFileSync(path.join(__dirname, 'constants.js'), 'utf8');
    const probabilityFile = fs.readFileSync(path.join(__dirname, 'probability_model.js'), 'utf8');
    const simulationFile = fs.readFileSync(path.join(__dirname, 'simulation_engine.js'), 'utf8');

    // Execute the code
    eval(constantsFile);
    eval(probabilityFile);
    eval(simulationFile);

    console.log('🧪 Verifying our fixes...\n');
    
    // Test the problematic levels
    const testLevels = [40, 70, 100, 150];
    const targets = {
        40: {SLG: 0.320},
        70: {SLG: 0.420},
        100: {SLG: 0.570},
        150: {BA: 0.380, SLG: 0.900}
    };

    for (let level of testLevels) {
        try {
            const stats = simulatePlayerStats(level, level, level, 5, 600); // Quick test with 5 sims
            const target = targets[level];
            
            console.log(`Level ${level}:`);
            if (target.SLG) {
                const slgGap = Math.abs(stats.SLG - target.SLG);
                const slgPct = slgGap / target.SLG * 100;
                console.log(`  SLG: ${stats.SLG.toFixed(3)} (target: ${target.SLG.toFixed(3)}, gap: ${slgPct.toFixed(1)}%)`);
            }
            if (target.BA) {
                const baGap = Math.abs(stats.BA - target.BA);  
                const baPct = baGap / target.BA * 100;
                console.log(`  BA:  ${stats.BA.toFixed(3)} (target: ${target.BA.toFixed(3)}, gap: ${baPct.toFixed(1)}%)`);
            }
            console.log('');
            
        } catch (error) {
            console.log(`❌ Error testing level ${level}: ${error.message}\n`);
        }
    }

} catch (error) {
    console.log(`❌ Setup error: ${error.message}`);
}