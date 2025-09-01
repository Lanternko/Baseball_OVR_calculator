// Test script for new simplified model
const constants = require('./src/js/constants.js');
const probabilityModel = require('./src/js/probability_model.js');

console.log('🧪 Testing new simplified model...');

// Test basic functionality
console.log('\n=== Basic Test ===');
try {
    const testResult = probabilityModel.simulateMultipleAtBats(100, 100, 100, 600);
    const stats = probabilityModel.calculateStats(testResult, 600);
    const finalStats = probabilityModel.finalizeStats(stats);
    
    console.log('✅ Test successful!');
    console.log(`BA: ${finalStats.BA.toFixed(3)}`);
    console.log(`OBP: ${finalStats.OBP.toFixed(3)}`);
    console.log(`SLG: ${finalStats.SLG.toFixed(3)}`);
    console.log(`HR: ${finalStats.HR}`);
    console.log(`2B: ${finalStats['2B']}`);
    console.log(`BB: ${finalStats.BB}`);
} catch (error) {
    console.log('❌ Test failed:', error.message);
}

// Test HIT effect
console.log('\n=== HIT Effect Test ===');
const hitLevels = [40, 70, 100, 130];
hitLevels.forEach(hit => {
    try {
        const result = probabilityModel.simulateMultipleAtBats(100, hit, 100, 600);
        const stats = probabilityModel.calculateStats(result, 600);
        const finalStats = probabilityModel.finalizeStats(stats);
        console.log(`HIT ${hit}: BA=${finalStats.BA.toFixed(3)}, HR=${finalStats.HR}`);
    } catch (error) {
        console.log(`❌ HIT ${hit} failed:`, error.message);
    }
});

// Test getPAEventProbabilities compatibility
console.log('\n=== Compatibility Test ===');
try {
    const probs = probabilityModel.getPAEventProbabilities(100, 100, 100);
    console.log('✅ getPAEventProbabilities works!');
    console.log(`HR: ${(probs.HR * 100).toFixed(1)}%`);
    console.log(`2B: ${(probs['2B'] * 100).toFixed(1)}%`);
    console.log(`1B: ${(probs['1B'] * 100).toFixed(1)}%`);
    console.log(`BB: ${(probs.BB * 100).toFixed(1)}%`);
} catch (error) {
    console.log('❌ Compatibility test failed:', error.message);
}

console.log('\n🎉 Test completed!');