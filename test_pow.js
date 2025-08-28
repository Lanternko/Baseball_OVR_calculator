// Test POW Model - Node.js compatible

// Mock browser environment
global.console = console;

// Load modules by reading and evaluating them
const fs = require('fs');
const path = require('path');

// Set up global scope to mimic browser environment
global.window = global;

// Function to safely evaluate JS files
function loadModule(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    eval(content);
}

try {
    // Load constants
    loadModule('constants.js');

    // Load probability model
    loadModule('probability_model.js');

    // Load simulation engine  
    loadModule('simulation_engine.js');
} catch (error) {
    console.error('Error loading modules:', error);
    process.exit(1);
}

console.log('🔥 Testing Updated POW Model with 2B-to-HR Conversion');
console.log('Fixed HIT=70, EYE=70, varying POW 40-150');
console.log('');

const results = [];
for (let pow = 40; pow <= 150; pow += 10) {
    const stats = simulatePlayerStats(pow, 70, 70, 100, 600);
    const hr = Math.round(stats.HR_count);
    const doubles = Math.round(stats.doubles_count || 0);
    const xbh = hr + doubles;
    const hrPct = xbh > 0 ? (hr / xbh * 100).toFixed(1) : '0.0';
    
    results.push({
        POW: pow,
        HR: hr,
        '2B': doubles,
        XBH: xbh,
        'HR/XBH%': hrPct,
        SLG: stats.SLG.toFixed(3)
    });
}

console.table(results);

// Focus on key percentile points
console.log('');
console.log('🎯 Key Percentile Analysis:');
const keyPoints = [40, 70, 99, 115, 130, 150];
keyPoints.forEach(pow => {
    const stats = simulatePlayerStats(pow, 70, 70, 500, 600);
    const hr = Math.round(stats.HR_count);
    const doubles = Math.round(stats.doubles_count || 0);
    const percentile = pow <= 40 ? 'PR1' : pow == 70 ? 'PR50' : pow == 99 ? 'PR99' : pow == 115 ? 'Elite(Ohtani)' : pow == 130 ? 'Super Elite' : 'Max';
    console.log(`POW ${pow} (${percentile}): ${hr} HR, ${doubles} 2B, SLG ${stats.SLG.toFixed(3)}`);
});

console.log('');
console.log('🔍 Detailed Analysis - Elite Power Players:');
[115, 130, 150].forEach(pow => {
    const probs = getPAEventProbabilities(pow, 70, 70);
    console.log(`POW ${pow}:`);
    console.log(`  HR Rate: ${(probs.HR * 100).toFixed(1)}%`);
    console.log(`  2B Rate: ${(probs['2B'] * 100).toFixed(1)}%`);
    console.log(`  Expected HR: ${Math.round(probs.HR * 600)}`);
    console.log(`  Expected 2B: ${Math.round(probs['2B'] * 600)}`);
});