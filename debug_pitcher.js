// Debugging script for pitcher calculations
// Run this in the browser console to test the calculation

function debugPitcherCalculation() {
    console.log('=== DEBUGGING PITCHER CALCULATION ===');

    // Test values (Yamamoto's stats)
    const testStats = {
        BB: 0.085,   // 8.5% BB rate
        Kp: 0.225,   // 22.5% K rate
        BA: 0.242,   // .242 BAA
        SLG: 0.385   // .385 SLGA
    };

    console.log('Input stats:', testStats);

    // Check if functions exist
    console.log('Functions available:');
    console.log('- reverseInterpolate:', typeof window.reverseInterpolate);
    console.log('- PITCHER_CONTROL_TABLE:', typeof window.PITCHER_CONTROL_TABLE);
    console.log('- PITCHER_STRIKEOUT_TABLE:', typeof window.PITCHER_STRIKEOUT_TABLE);
    console.log('- PITCHER_STUFF_TABLE:', typeof window.PITCHER_STUFF_TABLE);
    console.log('- PITCHER_SUPPRESSION_TABLE:', typeof window.PITCHER_SUPPRESSION_TABLE);

    if (typeof window.reverseInterpolate === 'function') {
        try {
            const attrs = {
                CONTROL: window.reverseInterpolate(testStats.BB, window.PITCHER_CONTROL_TABLE),
                STRIKEOUT: window.reverseInterpolate(testStats.Kp, window.PITCHER_STRIKEOUT_TABLE),
                STUFF: window.reverseInterpolate(testStats.BA, window.PITCHER_STUFF_TABLE),
                SUPPRESSION: window.reverseInterpolate(testStats.SLG, window.PITCHER_SUPPRESSION_TABLE)
            };

            console.log('Calculated attributes:', attrs);

            // Check if OVR calculation works
            if (typeof window.computePitcherOVR === 'function') {
                const ovr = window.computePitcherOVR(attrs);
                console.log('Calculated OVR:', ovr);
            }

            return attrs;
        } catch (error) {
            console.error('Error in calculation:', error);
        }
    } else {
        console.error('reverseInterpolate function not available');
    }
}

function debugCurrentInputs() {
    console.log('=== CURRENT INPUT VALUES ===');

    const inputs = ['p1Name', 'p1BB', 'p1Kp', 'p1BA', 'p1SLG'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`${id}: "${el.value}"`);
        } else {
            console.log(`${id}: element not found`);
        }
    });
}

// Make functions available globally
window.debugPitcherCalculation = debugPitcherCalculation;
window.debugCurrentInputs = debugCurrentInputs;

console.log('Pitcher debug functions loaded!');
console.log('Usage:');
console.log('- debugCurrentInputs() - check current form values');
console.log('- debugPitcherCalculation() - test calculation with Yamamoto stats');