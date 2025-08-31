// Test improved reverse engineering
const fs = require('fs');
const path = require('path');

// Load required modules
try {
    const constantsCode = fs.readFileSync(path.join(__dirname, 'constants.js'), 'utf8');
    const probabilityCode = fs.readFileSync(path.join(__dirname, 'probability_model.js'), 'utf8');
    const simulationCode = fs.readFileSync(path.join(__dirname, 'simulation_engine.js'), 'utf8');
    const ovrCode = fs.readFileSync(path.join(__dirname, 'ovr_calculator.js'), 'utf8');
    const reverseCode = fs.readFileSync(path.join(__dirname, 'reverse_engineer.js'), 'utf8');
    
    eval(constantsCode);
    eval(probabilityCode);
    eval(simulationCode);
    eval(ovrCode);
    eval(reverseCode);
    
    console.log('✅ All modules loaded successfully');
} catch (error) {
    console.error('❌ Failed to load modules:', error.message);
    process.exit(1);
}

console.log('🧪 Testing Improved Reverse Engineering');
console.log('=' .repeat(60));

// Test cases with real 2024 player data
const testCases = [
    { 
        name: 'Ohtani 2024', 
        BA: 0.310, 
        OBP: 0.390, // Using wOBA as OBP approximation
        SLG: 0.646,
        expectedRange: { HIT: [60, 90], POW: [90, 130], EYE: [80, 120] }
    },
    { 
        name: 'Judge 2024', 
        BA: 0.322, 
        OBP: 0.458, 
        SLG: 0.701,
        expectedRange: { HIT: [80, 110], POW: [110, 140], EYE: [100, 130] }
    }
];

testCases.forEach(player => {
    console.log(`\n📊 ${player.name}:`);
    console.log(`Input: BA=${player.BA}, OBP=${player.OBP}, SLG=${player.SLG}`);
    
    try {
        // Test with improved iterative algorithm
        const result = reverseEngineerAttributes({
            BA: player.BA,
            OBP: player.OBP,
            SLG: player.SLG,
            PA: 600
        }, 0.005, 25);
        
        if (result && result.attributes) {
            const { HIT, POW, EYE, OVR } = result.attributes;
            
            console.log(`Result: HIT=${HIT}, POW=${POW}, EYE=${EYE}, OVR=${OVR}`);
            console.log(`Converged: ${result.converged ? 'Yes' : 'No'} (${result.iterations} iterations)`);
            
            // Check if values are reasonable
            const hitOk = HIT >= player.expectedRange.HIT[0] && HIT <= player.expectedRange.HIT[1];
            const powOk = POW >= player.expectedRange.POW[0] && POW <= player.expectedRange.POW[1];
            const eyeOk = EYE >= player.expectedRange.EYE[0] && EYE <= player.expectedRange.EYE[1];
            
            console.log(`Reasonableness: HIT ${hitOk ? '✅' : '❌'}, POW ${powOk ? '✅' : '❌'}, EYE ${eyeOk ? '✅' : '❌'}`);
            console.log(`Human Limit Check: ${POW <= 150 ? '✅ Within limits' : '❌ Exceeds 150'}`);
            
            // Verify accuracy by forward simulation
            const verification = simulatePlayerStats(POW, HIT, EYE, 20, 600);
            const baError = Math.abs(verification.BA - player.BA);
            const obpError = Math.abs(verification.OBP - player.OBP);
            const slgError = Math.abs(verification.SLG - player.SLG);
            
            console.log(`Verification: BA=${verification.BA.toFixed(3)} (err:${baError.toFixed(3)}), OBP=${verification.OBP.toFixed(3)} (err:${obpError.toFixed(3)}), SLG=${verification.SLG.toFixed(3)} (err:${slgError.toFixed(3)})`);
            
        } else {
            console.log('❌ Reverse engineering failed');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
});

console.log('\n🎯 Summary:');
console.log('- Reduced adjustment coefficients: HIT(100→50), EYE(150→60), POW(80→40)');
console.log('- This should prevent extreme overshoot in iterative convergence');
console.log('- Target: Keep POW values under 150 for realistic players');