// Test OVR integration with the main calculator
// Load required modules
const fs = require('fs');
const path = require('path');

// Read and evaluate the ovr_calculator.js file
try {
    const ovrCalculatorCode = fs.readFileSync(path.join(__dirname, 'ovr_calculator.js'), 'utf8');
    eval(ovrCalculatorCode);
    
    console.log('✅ Successfully loaded ovr_calculator.js');
} catch (error) {
    console.error('❌ Failed to load ovr_calculator.js:', error.message);
    process.exit(1);
}

console.log('🧪 Testing OVR Integration with Main Calculator');
console.log('=' .repeat(50));

// Test the screenshot example (64/143/109)
console.log('\n📸 Screenshot Example Test:');
console.log('Input: HIT=64, POW=143, EYE=109');

const result = calculateBatterOVR(143, 64, 109); // POW, HIT, EYE order

console.log('Result:', result);
console.log(`Final OVR: ${result.ovr}`);
console.log(`Average: ${((64 + 143 + 109) / 3).toFixed(1)}`);
console.log(`Balance Ratio: ${result.breakdown.balanceRatio}`);
console.log(`Unbalance Penalty: ${result.breakdown.unbalancePenalty}`);

// Test perfect 100s
console.log('\n🎯 Perfect 100s Test:');
console.log('Input: HIT=100, POW=100, EYE=100');

const perfect100 = calculateBatterOVR(100, 100, 100);
console.log(`Final OVR: ${perfect100.ovr} (should be exactly 100)`);
console.log(`Penalty: ${perfect100.breakdown.unbalancePenalty} (should be 0)`);

console.log('\n🎯 New Formula Verification:');
console.log('✓ Level 100 attributes = OVR 100:', perfect100.ovr === 100 ? 'PASS' : 'FAIL');
console.log('✓ Unbalance penalty system active:', parseFloat(result.breakdown.unbalancePenalty) > 0 ? 'PASS' : 'FAIL');
console.log('✓ No more elite bonuses:', !result.breakdown.hasOwnProperty('eliteBonus') ? 'PASS' : 'FAIL');