// main.js - 主程式邏輯

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

// 測試理論極限值
function testExtremeValues() {
    console.log("🧪 測試理論極限值 (BA=1.0, SLG=4.0, OBA=1.0)...");
    
    const extremeAttribs = calculatePlayerGameAttributes(1.0, 4.0, 1.0);
    const extremeStats = simulatePlayerStats(extremeAttribs.POW, extremeAttribs.HIT, extremeAttribs.EYE, 50, 600);
    const extremeOVR = calculateBatterOVR(extremeAttribs.POW, extremeAttribs.HIT, extremeAttribs.EYE);
    
    const testResults = document.getElementById('testResults');
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

// 測試高端值
function testHighValues() {
    console.log("🧪 測試高端值 (300, 300, 300)...");
    
    const highStats = simulatePlayerStats(300, 300, 300, 50, 600);
    const highOVR = calculateBatterOVR(300, 300, 300);
    
    const testResults = document.getElementById('testResults');
    testResults.style.display = 'block';
    testResults.innerHTML = `
🚀 高端值測試結果:

🔧 輸入三圍: POW=300, HIT=300, EYE=300

📈 模擬表現:
   打擊率: ${highStats.BA.toFixed(3)}
   長打率: ${highStats.SLG.toFixed(3)}
   上壘率: ${highStats.OBP.toFixed(3)}
   OPS: ${highStats.OPS.toFixed(3)}
   全壘打: ${highStats.HR_count} / 600 PA (${(highStats.HR_count/600*100).toFixed(1)}%)
   三振率: ${(highStats.K_rate*100).toFixed(1)}%
   保送率: ${(highStats.BB_rate*100).toFixed(1)}%
   
⭐ 綜合評價: OVR ${highOVR.ovr}

💡 期望表現:
   應該達到明星級別的統計數據
   BA > 0.700, SLG > 3.000, OBP > 0.700
`;
}

// 測試當前系統上限
function testCurrentSystem() {
    console.log("🧪 測試當前系統各個上限...");
    
    // 測試不同級別的三圍
    const testCases = [
        {name: "正常優秀 (99,99,99)", pow: 99, hit: 99, eye: 99},
        {name: "超級明星 (150,150,150)", pow: 150, hit: 150, eye: 150},
        {name: "極端值 (200,200,200)", pow: 200, hit: 200, eye: 200},
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
    testResults.style.display = 'block';
    testResults.innerHTML = resultsText;
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 棒球能力值計算器已載入（分離版本）');
    
    // 設置輸入驗證
    ['xBA', 'xSLG', 'xwOBA'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const maxVal = id === 'xSLG' ? 4 : 1;
            if (value < 0 || value > maxVal) {
                this.style.borderColor = '#ff6b6b';
            } else {
                this.style.borderColor = '#4ecdc4';
            }
        });
    });
    
    ['inputPOW', 'inputHIT', 'inputEYE'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value < 0 || value > 500) {
                this.style.borderColor = '#ff6b6b';
            } else if (value > 200) {
                this.style.borderColor = '#ff9500'; // 橙色表示極端值
            } else {
                this.style.borderColor = '#4ecdc4';
            }
        });
    });
    
    const paInput = document.getElementById('inputPA');
    paInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value < 1 || value > 1000) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '#4ecdc4';
        }
    });
    
    // 自動運行一次系統測試（可選）
    // testCurrentSystem();
});

// 測試極端值處理的完整函數
function testExtremeValueHandling() {
    console.log("🧪 開始極端值處理完整測試...");
    
    // 測試理論極限
    const extremeAttribs = calculatePlayerGameAttributes(1.0, 4.0, 1.0);
    console.log("理論極限轉換結果:", extremeAttribs);
    
    // 測試反向模擬
    const extremeStats = simulatePlayerStats(extremeAttribs.POW, extremeAttribs.HIT, extremeAttribs.EYE, 50, 600);
    console.log("極限三圍模擬結果:", {
        BA: extremeStats.BA.toFixed(3),
        SLG: extremeStats.SLG.toFixed(3),
        OBP: extremeStats.OBP.toFixed(3),
        HR: extremeStats.HR_count
    });
    
    // 檢查是否達到理論極限
    const baError = Math.abs(extremeStats.BA - 1.0);
    const slgError = Math.abs(extremeStats.SLG - 4.0);
    const obpError = Math.abs(extremeStats.OBP - 1.0);
    
    console.log("誤差分析:", {
        BA_error: baError.toFixed(3),
        SLG_error: slgError.toFixed(3),
        OBP_error: obpError.toFixed(3),
        status: (baError < 0.1 && slgError < 0.5 && obpError < 0.1) ? "✅ 極限值處理成功" : "❌ 需要進一步調整"
    });
}