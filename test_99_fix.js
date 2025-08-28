// 測試全99屬性的改善效果
// 載入必要模組
const fs = require('fs');
const vm = require('vm');

// 創建沙盒環境
const sandbox = {};

// 載入常數
const constants = fs.readFileSync('constants.js', 'utf8');
vm.createContext(sandbox);
vm.runInContext(constants, sandbox);

// 載入概率模型
const probabilityModel = fs.readFileSync('probability_model.js', 'utf8');
vm.runInContext(probabilityModel, sandbox);

// 載入模擬引擎  
const simulationEngine = fs.readFileSync('simulation_engine.js', 'utf8');
vm.runInContext(simulationEngine, sandbox);

// 載入OVR計算器
const ovrCalculator = fs.readFileSync('ovr_calculator.js', 'utf8');
vm.runInContext(ovrCalculator, sandbox);

console.log('🔄 測試全99屬性的雙向轉換...');

// 執行測試
const pow = 99, hit = 99, eye = 99;

try {
    // 步驟1: 屬性 → 模擬
    const simulated = sandbox.simulatePlayerStats(pow, hit, eye, 200, 600);
    console.log('\n📊 模擬結果:');
    console.log(`BA: ${simulated.BA.toFixed(3)}`);
    console.log(`OBP: ${simulated.OBP.toFixed(3)}`);
    console.log(`SLG: ${simulated.SLG.toFixed(3)}`);
    console.log(`OPS: ${(simulated.OBP + simulated.SLG).toFixed(3)}`);
    
    // 步驟2: 模擬 → 轉換
    const converted = sandbox.calculatePlayerGameAttributes(simulated.BA, simulated.SLG, simulated.OBP);
    console.log('\n🔄 轉換結果:');
    console.log(`POW: ${converted.POW.toFixed(1)} (原始: ${pow})`);
    console.log(`HIT: ${converted.HIT.toFixed(1)} (原始: ${hit})`);
    console.log(`EYE: ${converted.EYE.toFixed(1)} (原始: ${eye})`);
    
    // 步驟3: 計算誤差
    const powError = Math.abs(converted.POW - pow);
    const hitError = Math.abs(converted.HIT - hit);
    const eyeError = Math.abs(converted.EYE - eye);
    const totalError = powError + hitError + eyeError;
    
    console.log('\n📈 誤差分析:');
    console.log(`POW 誤差: ${powError.toFixed(1)}`);
    console.log(`HIT 誤差: ${hitError.toFixed(1)}`);
    console.log(`EYE 誤差: ${eyeError.toFixed(1)}`);
    console.log(`總誤差: ${totalError.toFixed(1)}`);
    
    const status = totalError < 9 ? '🎯 優秀' : totalError < 15 ? '✅ 良好' : '❌ 需改善';
    console.log(`\n評級: ${status}`);
    
    // README目標對比
    console.log('\n🎯 README目標對比 (明星級 OVR 95-100):');
    console.log('目標 BA: .280-.320');
    console.log('目標 SLG: .470-.570');
    console.log('目標 OBP: .370-.420');
    
    const baInRange = simulated.BA >= 0.280 && simulated.BA <= 0.320;
    const slgInRange = simulated.SLG >= 0.470 && simulated.SLG <= 0.570;
    const obpInRange = simulated.OBP >= 0.370 && simulated.OBP <= 0.420;
    
    console.log(`BA ${baInRange ? '✅' : '❌'} 符合範圍`);
    console.log(`SLG ${slgInRange ? '✅' : '❌'} 符合範圍`);
    console.log(`OBP ${obpInRange ? '✅' : '❌'} 符合範圍`);
    
} catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error(error.stack);
}