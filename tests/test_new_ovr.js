// Test the new OVR formula
// Load the OVR calculator
const fs = require('fs');
const path = require('path');

// Read and evaluate the ovr_calculator.js file
const ovrCalculatorCode = fs.readFileSync(path.join(__dirname, 'ovr_calculator.js'), 'utf8');
eval(ovrCalculatorCode);

console.log('🧪 Testing New OVR Formula (Level 100 = OVR 100, Unbalance Penalties)');
console.log('=' .repeat(60));

// Test cases
const testCases = [
    { name: 'Screenshot Example (64/143/109)', hit: 64, pow: 143, eye: 109 },
    { name: 'Balanced 100s', hit: 100, pow: 100, eye: 100 },
    { name: 'Balanced 80s', hit: 80, pow: 80, eye: 80 },
    { name: 'Unbalanced (50/150/100)', hit: 50, pow: 150, eye: 100 },
    { name: 'Very Unbalanced (30/180/90)', hit: 30, pow: 180, eye: 90 },
    { name: 'Perfect Balance (90/90/90)', hit: 90, pow: 90, eye: 90 },
    { name: 'Elite Balanced (120/120/120)', hit: 120, pow: 120, eye: 120 },
];

testCases.forEach(testCase => {
    console.log(`\n📊 ${testCase.name}:`);
    console.log(`    Attributes: HIT=${testCase.hit}, POW=${testCase.pow}, EYE=${testCase.eye}`);
    
    const result = calculateBatterOVR(testCase.pow, testCase.hit, testCase.eye);
    const average = (testCase.hit + testCase.pow + testCase.eye) / 3;
    const balanceRatio = Math.min(testCase.hit, testCase.pow, testCase.eye) / Math.max(testCase.hit, testCase.pow, testCase.eye);
    
    console.log(`    Average: ${average.toFixed(1)}`);
    console.log(`    Balance Ratio: ${balanceRatio.toFixed(3)}`);
    console.log(`    OVR: ${result.ovr} (Base: ${result.breakdown.baseOVR}, Penalty: -${result.breakdown.unbalancePenalty})`);
    console.log(`    Difference from Average: ${(result.ovr - average).toFixed(1)}`);
});

console.log('\n🎯 Formula Summary:');
console.log('- Base OVR = Arithmetic Mean (100 attributes = 100 OVR)');
console.log('- Unbalance Penalty applies when balance ratio < 0.8');
console.log('- More severe penalties for greater imbalances');
console.log('- No bonuses, only penalties for specialization');