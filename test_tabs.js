// Console commands to test tab switching
// Copy and paste these into the browser console when the page is loaded

console.log('=== TAB SWITCHING TEST COMMANDS ===');
console.log('Run these commands in the browser console:');
console.log('');

console.log('1. Check current elements:');
console.log('   debugElements()');
console.log('');

console.log('2. Switch to pitcher tab:');
console.log('   showTopTab("pitcher")');
console.log('');

console.log('3. Switch to batter tab:');
console.log('   showTopTab("batter")');
console.log('');

console.log('4. Check what classes are on body:');
console.log('   console.log(document.body.className)');
console.log('');

// Debug function
function debugElements() {
    console.log('=== CURRENT STATE ===');

    const batterTabs = document.querySelectorAll('.panel-batter');
    const pitcherTabs = document.querySelectorAll('.panel-pitcher');

    console.log('Body classes:', document.body.className);
    console.log('');

    console.log('Batter panels:');
    batterTabs.forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        console.log(`  ${i+1}. ${el.id}`);
        console.log(`     classes: ${el.className}`);
        console.log(`     inline style: ${el.style.display || 'none'}`);
        console.log(`     computed display: ${computed.display}`);
        console.log(`     visible: ${computed.display !== 'none'}`);
    });

    console.log('');
    console.log('Pitcher panels:');
    pitcherTabs.forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        console.log(`  ${i+1}. ${el.id}`);
        console.log(`     classes: ${el.className}`);
        console.log(`     inline style: ${el.style.display || 'none'}`);
        console.log(`     computed display: ${computed.display}`);
        console.log(`     visible: ${computed.display !== 'none'}`);
    });

    console.log('');
    const bBtn = document.getElementById('tabBatter');
    const pBtn = document.getElementById('tabPitcher');
    console.log('Tab buttons:');
    console.log(`  Batter button active: ${bBtn?.classList.contains('active')}`);
    console.log(`  Pitcher button active: ${pBtn?.classList.contains('active')}`);
}

// Make function available globally
window.debugElements = debugElements;

console.log('Functions loaded. Now open the page and run debugElements() to check current state.');