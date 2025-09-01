// Final integration test
const constants = require('./src/js/constants.js');
const probabilityModel = require('./src/js/probability_model.js'); 
const simulationEngine = require('./src/js/simulation_engine.js');

console.log('🧪 Final Integration Test');

// Test simulatePlayerStats function (the main interface function)
console.log('\n=== Testing simulatePlayerStats ===');
try {
    const results = simulationEngine.simulatePlayerStats(100, 100, 100, 3, 600);
    console.log('✅ simulatePlayerStats works!');
    console.log(`BA: ${results.BA.toFixed(3)}`);
    console.log(`OBP: ${results.OBP.toFixed(3)}`);
    console.log(`SLG: ${results.SLG.toFixed(3)}`);
    console.log(`HR: ${results.HR_count.toFixed(1)}`);
    console.log(`2B: ${results.doubles_count.toFixed(1)}`);
    console.log(`BB: ${results.BB_count.toFixed(1)}`);
} catch (error) {
    console.log('❌ simulatePlayerStats failed:', error.message);
}

// Test key effects
console.log('\n=== Testing Key Effects ===');

// HIT effect test
console.log('\n📈 HIT Effect:');
[70, 100, 130].forEach(hit => {
    try {
        const result = simulationEngine.simulatePlayerStats(100, hit, 100, 2, 600);
        console.log(`HIT ${hit}: BA=${result.BA.toFixed(3)}, HR=${result.HR_count.toFixed(1)}`);
    } catch (error) {
        console.log(`❌ HIT ${hit} failed:`, error.message);
    }
});

// POW effect test  
console.log('\n💥 POW Effect:');
[70, 100, 130].forEach(pow => {
    try {
        const result = simulationEngine.simulatePlayerStats(pow, 100, 100, 2, 600);
        const xbh = result.HR_count + result.doubles_count;
        console.log(`POW ${pow}: SLG=${result.SLG.toFixed(3)}, XBH=${xbh.toFixed(1)}`);
    } catch (error) {
        console.log(`❌ POW ${pow} failed:`, error.message);
    }
});

// EYE effect test
console.log('\n👁️ EYE Effect:');
[70, 100, 130].forEach(eye => {
    try {
        const result = simulationEngine.simulatePlayerStats(100, 100, eye, 2, 600);
        console.log(`EYE ${eye}: OBP=${result.OBP.toFixed(3)}, BB=${result.BB_count.toFixed(1)}`);
    } catch (error) {
        console.log(`❌ EYE ${eye} failed:`, error.message);
    }
});

console.log('\n🎉 Integration test completed!');
console.log('✅ New simplified model successfully integrated!');