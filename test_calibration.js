// 測試校準效果 - Node.js compatible
const fs = require('fs');
global.console = console;
global.window = global;

function loadModule(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    eval(content);
}

try {
    loadModule('constants.js');
    loadModule('probability_model.js');
    loadModule('simulation_engine.js');
    loadModule('ovr_calculator.js');
} catch (error) {
    console.error('Error loading modules:', error);
    process.exit(1);
}

console.log('🎯 大谷2024校準測試');
console.log('=====================================');

// 大谷真實數據
const ohtaniReal = {xBA: 0.310, xSLG: 0.646, xwOBA: 0.390};
console.log(`大谷真實表現: BA ${ohtaniReal.xBA}, SLG ${ohtaniReal.xSLG}, wOBA ${ohtaniReal.xwOBA}`);

// 轉換為屬性值
const converted = calculatePlayerGameAttributes(ohtaniReal.xBA, ohtaniReal.xSLG, ohtaniReal.xwOBA);
console.log(`轉換屬性值: POW ${converted.POW.toFixed(0)}, HIT ${converted.HIT.toFixed(0)}, EYE ${converted.EYE.toFixed(0)}`);

// 模擬表現
const simulated = simulatePlayerStats(converted.POW, converted.HIT, converted.EYE, 100, 600);
console.log(`模擬表現: BA ${simulated.BA.toFixed(3)}, OBP ${simulated.OBP.toFixed(3)}, SLG ${simulated.SLG.toFixed(3)}`);

// 計算差異
const baDiff = simulated.BA - ohtaniReal.xBA;
const obpDiff = simulated.OBP - ohtaniReal.xwOBA;
const slgDiff = simulated.SLG - ohtaniReal.xSLG;

console.log(`\n📊 預測準確度:`);
console.log(`BA 差異: ${baDiff >= 0 ? '+' : ''}${baDiff.toFixed(3)} ${Math.abs(baDiff) < 0.010 ? '✅' : '❌'}`);
console.log(`OBP 差異: ${obpDiff >= 0 ? '+' : ''}${obpDiff.toFixed(3)} ${Math.abs(obpDiff) < 0.010 ? '✅' : '❌'}`);
console.log(`SLG 差異: ${slgDiff >= 0 ? '+' : ''}${slgDiff.toFixed(3)} ${Math.abs(slgDiff) < 0.015 ? '✅' : '❌'}`);

const totalError = Math.abs(baDiff) + Math.abs(obpDiff) + Math.abs(slgDiff);
console.log(`\n🎯 總誤差: ${totalError.toFixed(3)} ${totalError < 0.030 ? '(優秀)' : totalError < 0.050 ? '(良好)' : '(需改善)'}`);

// 測試其他球員數據驗證
console.log('\n🔍 其他頂尖球員驗證:');
const testCases = [
    {name: 'Judge 2022', xBA: 0.311, xSLG: 0.686, xwOBA: 0.457},
    {name: 'Mookie 2020', xBA: 0.292, xSLG: 0.565, xwOBA: 0.435},
    {name: 'Freeman 2021', xBA: 0.300, xSLG: 0.503, xwOBA: 0.393}
];

testCases.forEach(player => {
    const attrs = calculatePlayerGameAttributes(player.xBA, player.xSLG, player.xwOBA);
    const sim = simulatePlayerStats(attrs.POW, attrs.HIT, attrs.EYE, 50, 600);
    const error = Math.abs(sim.BA - player.xBA) + Math.abs(sim.OBP - player.xwOBA) + Math.abs(sim.SLG - player.xSLG);
    console.log(`${player.name}: 誤差 ${error.toFixed(3)} ${error < 0.040 ? '✅' : '❌'}`);
});