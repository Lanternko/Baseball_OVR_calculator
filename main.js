// main.js - 主程式邏輯（修正版）

// 計算三圍和 OVR（從數據輸入）
function calculateAttributes() {
    const xBA = parseFloat(document.getElementById('xBA').value);
    const xSLG = parseFloat(document.getElementById('xSLG').value);
    const xwOBA = parseFloat(document.getElementById('xwOBA').value);
    
    if (!xBA || !xSLG || !xwOBA) {
        alert('請填入所有數據！');
        return;
    }
    
    if (xBA < 0 || xBA > 1 || xSLG < 0 || xSLG > 4 || xwOBA < 0 || xwOBA > 1) {
        alert('請確保所有數據都在合理範圍內！');
        return;
    }
    
    const attributes = calculatePlayerGameAttributes(xBA, xSLG, xwOBA);
    const ovrResult = calculateBatterOVR(attributes.POW, attributes.HIT, attributes.EYE);
    
    document.getElementById('powResult').textContent = attributes.POW.toFixed(1);
    document.getElementById('hitResult').textContent = attributes.HIT.toFixed(1);
    document.getElementById('eyeResult').textContent = attributes.EYE.toFixed(1);
    document.getElementById('ovrFromStats').textContent = ovrResult.ovr;
    
    displayOVRBreakdown(ovrResult.breakdown, document.getElementById('ovrBreakdownStats'));
    
    document.getElementById('attributeResults').style.display = 'block';
}

// 計算預測數據和 OVR（從三圍輸入）
function calculateStats() {
    const pow = parseFloat(document.getElementById('inputPOW').value);
    const hit = parseFloat(document.getElementById('inputHIT').value);
    const eye = parseFloat(document.getElementById('inputEYE').value);
    const pa = parseInt(document.getElementById('inputPA').value);
    
    if (!pow || !hit || !eye || !pa) {
        alert('請填入所有三圍和打席數！');
        return;
    }
    
    if (pow < 0 || hit < 0 || eye < 0 || pa < 1) {
        alert('請確保所有數值都為正數！');
        return;
    }
    
    if (pow > 500 || hit > 500 || eye > 500) {
        alert('三圍不得超過500！');
        return;
    }
    
    // 運行模擬
    const stats = simulatePlayerStats(pow, hit, eye, NUM_SIMULATIONS, pa);
    const ovrResult = calculateBatterOVR(pow, hit, eye);
    
    // 顯示結果
    document.getElementById('baResult').textContent = stats.BA.toFixed(3);
    document.getElementById('obpResult').textContent = stats.OBP.toFixed(3);
    document.getElementById('slgResult').textContent = stats.SLG.toFixed(3);
    document.getElementById('opsResult').textContent = stats.OPS.toFixed(3);
    document.getElementById('hrResult').textContent = Math.round(stats.HR_count);
    document.getElementById('bbRateResult').textContent = (stats.BB_rate * 100).toFixed(1) + '%';
    document.getElementById('kRateResult').textContent = (stats.K_rate * 100).toFixed(1) + '%';
    document.getElementById('ovrFromAttributes').textContent = ovrResult.ovr;
    
    displayOVRBreakdown(ovrResult.breakdown, document.getElementById('ovrBreakdownAttributes'));
    
    document.getElementById('statsResults').style.display = 'block';
}

// 🧪 測試函數群組

// 測試正常範圍精確度
function testNormalRange() {
    console.log("🧪 測試正常範圍精確度 (100,100,100)...");
    
    const normalStats = simulatePlayerStats(100, 100, 100, 100, 600);
    const normalOVR = calculateBatterOVR(100, 100, 100);
    
    const testResults = document.getElementById('testResults');
    if (testResults) {
        testResults.style.display = 'block';
        testResults.innerHTML = `
🎯 正常範圍測試結果:

🔧 輸入三圍: POW=100, HIT=100, EYE=100

📈 模擬表現:
   打擊率: ${normalStats.BA.toFixed(3)} (期望: ~0.320)
   長打率: ${normalStats.SLG.toFixed(3)} (期望: ~0.590)
   上壘率: ${normalStats.OBP.toFixed(3)} (期望: ~0.400)
   OPS: ${normalStats.OPS.toFixed(3)} (期望: ~0.990)
   全壘打: ${normalStats.HR_count} / 600 PA (期望: ~40)
   三振率: ${(normalStats.K_rate*100).toFixed(1)}% (期望: ~15%)
   保送率: ${(normalStats.BB_rate*100).toFixed(1)}% (期望: ~12%)
   
⭐ 綜合評價: OVR ${normalOVR.ovr}

💡 這應該接近原型球員 PR99 的水準
`;
    }
}

// 測試理論極限值
function testExtremeValues() {
    console.log("🧪 測試理論極限值 (BA=1.0, SLG=4.0, OBA=1.0)...");
    
    const extremeAttribs = calculatePlayerGameAttributes(1.0, 4.0, 1.0);
    const extremeStats = simulatePlayerStats(extremeAttribs.POW, extremeAttribs.HIT, extremeAttribs.EYE, 50, 600);
    const extremeOVR = calculateBatterOVR(extremeAttribs.POW, extremeAttribs.HIT, extremeAttribs.EYE);
    
    const testResults = document.getElementById('testResults');
    if (testResults) {
        testResults.style.display = 'block';
        testResults.innerHTML = `
🎯 理論極限值測試結果:

📊 輸入數據: BA=1.000, SLG=4.000, OBA=1.000

🔧 轉換三圍:
   POW: ${extremeAttribs.POW}
   HIT: ${extremeAttribs.HIT} 
   EYE: ${extremeAttribs.EYE}

📈 模擬表現:
   打擊率: ${extremeStats.BA.toFixed(3)} (目標: 接近 1.000)
   長打率: ${extremeStats.SLG.toFixed(3)} (目標: 接近 4.000)
   上壘率: ${extremeStats.OBP.toFixed(3)} (目標: 接近 1.000)
   OPS: ${extremeStats.OPS.toFixed(3)}
   全壘打: ${extremeStats.HR_count} / 600 PA
   
⭐ 綜合評價: OVR ${extremeOVR.ovr}

✅ 檢驗結果:
   BA 誤差: ${Math.abs(extremeStats.BA - 1.0).toFixed(3)}
   SLG 誤差: ${Math.abs(extremeStats.SLG - 4.0).toFixed(3)}
   OBP 誤差: ${Math.abs(extremeStats.OBP - 1.0).toFixed(3)}
`;
    }
}

// 測試當前系統各級別
function testCurrentSystem() {
    console.log("🧪 測試當前系統各個級別...");
    
    const testCases = [
        {name: "正常優秀 (99,99,99)", pow: 99, hit: 99, eye: 99},
        {name: "正常頂尖 (130,130,130)", pow: 130, hit: 130, eye: 130},
        {name: "極端入門 (200,200,200)", pow: 200, hit: 200, eye: 200},
        {name: "理論上限 (500,500,500)", pow: 500, hit: 500, eye: 500}
    ];
    
    let resultsText = "🎯 系統各級別測試結果:\n\n";
    
    testCases.forEach(testCase => {
        const stats = simulatePlayerStats(testCase.pow, testCase.hit, testCase.eye, 25, 600);
        const ovr = calculateBatterOVR(testCase.pow, testCase.hit, testCase.eye);
        
        resultsText += `${testCase.name}:\n`;
        resultsText += `   BA: ${stats.BA.toFixed(3)} | SLG: ${stats.SLG.toFixed(3)} | OBP: ${stats.OBP.toFixed(3)}\n`;
        resultsText += `   HR: ${stats.HR_count} | OVR: ${ovr.ovr}\n\n`;
    });
    
    const testResults = document.getElementById('testResults');
    if (testResults) {
        testResults.style.display = 'block';
        testResults.innerHTML = resultsText;
    }
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 棒球能力值計算器 v2.1 已載入（模塊化 & 修正版）');
    
    // 設置輸入驗證
    ['xBA', 'xSLG', 'xwOBA'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                const maxVal = id === 'xSLG' ? 4 : 1;
                if (value < 0 || value > maxVal) {
                    this.style.borderColor = '#ff6b6b';
                } else {
                    this.style.borderColor = '#4ecdc4';
                }
            });
        }
    });
    
    ['inputPOW', 'inputHIT', 'inputEYE'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (value < 0 || value > 500) {
                    this.style.borderColor = '#ff6b6b';
                } else if (value >= 200) {
                    this.style.borderColor = '#ff9500'; // 橙色表示極端值
                } else {
                    this.style.borderColor = '#4ecdc4';
                }
            });
        }
    });
    
    const paInput = document.getElementById('inputPA');
    if (paInput) {
        paInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1 || value > 1000) {
                this.style.borderColor = '#ff6b6b';
            } else {
                this.style.borderColor = '#4ecdc4';
            }
        });
    }
    
    // 自動運行一次正常範圍測試（驗證修正效果）
    // testNormalRange();
});

// 窗口全局函數，供測試使用
window.testNormalRange = testNormalRange;
window.testExtremeValues = testExtremeValues;
window.testCurrentSystem = testCurrentSystem;