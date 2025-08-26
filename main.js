// main.js - 修正版主程式邏輯

// 🔧 修正版：計算三圍和 OVR（從數據輸入）
function calculateAttributes() {
    // 🔧 允許 0 值輸入
    const xBA = parseFloat(document.getElementById('xBA').value);
    const xSLG = parseFloat(document.getElementById('xSLG').value);
    const xwOBA = parseFloat(document.getElementById('xwOBA').value);
    
    console.log('原始輸入:', { xBA, xSLG, xwOBA });
    
    // 🔧 處理 0 值和 NaN
    const safeXBA = isNaN(xBA) ? 0 : Math.max(0, xBA);
    const safeXSLG = isNaN(xSLG) ? 0 : Math.max(0, xSLG);
    const safeXwOBA = isNaN(xwOBA) ? 0 : Math.max(0, xwOBA);
    
    console.log('安全輸入:', { safeXBA, safeXSLG, safeXwOBA });
    
    // 基本範圍驗證
    if (safeXBA > 1 || safeXSLG > 4 || safeXwOBA > 1) {
        alert('請確保數據在合理範圍內！BA/OBP ≤ 1.0, SLG ≤ 4.0');
        return;
    }
    
    const attributes = calculatePlayerGameAttributes(safeXBA, safeXSLG, safeXwOBA);
    console.log('轉換結果:', attributes);
    
    const ovrResult = calculateBatterOVR(attributes.POW, attributes.HIT, attributes.EYE);
    console.log('OVR結果:', ovrResult);
    
    // 🔧 顯示結果（保留小數）
    document.getElementById('powResult').textContent = attributes.POW.toFixed(1);
    document.getElementById('hitResult').textContent = attributes.HIT.toFixed(1);
    document.getElementById('eyeResult').textContent = attributes.EYE.toFixed(1);
    document.getElementById('ovrFromStats').textContent = ovrResult.ovr;
    
    displayOVRBreakdown(ovrResult.breakdown, document.getElementById('ovrBreakdownStats'));
    
    document.getElementById('attributeResults').style.display = 'block';
}

// 🔧 修正版：計算預測數據和 OVR（從三圍輸入）
function calculateStats() {
    const pow = parseFloat(document.getElementById('inputPOW').value);
    const hit = parseFloat(document.getElementById('inputHIT').value);
    const eye = parseFloat(document.getElementById('inputEYE').value);
    const pa = parseInt(document.getElementById('inputPA').value);
    
    console.log('三圍輸入:', { pow, hit, eye, pa });
    
    // 🔧 處理 NaN 和設置預設值
    const safePOW = isNaN(pow) ? 70 : Math.max(0, pow);
    const safeHIT = isNaN(hit) ? 70 : Math.max(0, hit);
    const safeEYE = isNaN(eye) ? 70 : Math.max(0, eye);
    const safePA = isNaN(pa) ? 600 : Math.max(1, pa);
    
    if (safePOW > 500 || safeHIT > 500 || safeEYE > 500) {
        alert('三圍不得超過500！');
        return;
    }
    
    // 運行模擬
    const stats = simulatePlayerStats(safePOW, safeHIT, safeEYE, NUM_SIMULATIONS, safePA);
    const ovrResult = calculateBatterOVR(safePOW, safeHIT, safeEYE);
    
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

// 🔧 修正版：設定預設值（移除，讓用戶能輸入 0）
function setDefaultValues() {
    // 只在欄位完全空白時設定預設值
    const inputs = [
        {id: 'xBA', defaultVal: 0.280},
        {id: 'xSLG', defaultVal: 0.450}, 
        {id: 'xwOBA', defaultVal: 0.350},
        {id: 'inputPOW', defaultVal: 85},
        {id: 'inputHIT', defaultVal: 75},
        {id: 'inputEYE', defaultVal: 80},
        {id: 'inputPA', defaultVal: 600}
    ];
    
    inputs.forEach(input => {
        const element = document.getElementById(input.id);
        if (element && element.value === '') { // 只在完全空白時設定
            element.value = input.defaultVal;
        }
    });
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 棒球能力值計算器 v2.2 已載入（平滑轉換版）');
    
    // 不自動設定預設值，讓用戶看到 placeholder 顏色
    
    // 🔧 修正輸入驗證：允許 0 值
    ['xBA', 'xSLG', 'xwOBA'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // 🔧 修改 step 屬性允許更精細輸入
            input.step = '0.001';
            input.min = '0'; // 明確設定最小值為 0
            
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                const maxVal = id === 'xSLG' ? 4 : 1;
                
                // 🔧 允許 0 值
                if (isNaN(value) || value < 0 || value > maxVal) {
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
            input.min = '0'; // 明確設定最小值為 0
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0 || value > 500) {
                    this.style.borderColor = '#ff6b6b';
                } else if (value >= 200) {
                    this.style.borderColor = '#ff9500';
                } else {
                    this.style.borderColor = '#4ecdc4';
                }
            });
        }
    });
});

// 🧪 測試函數
function testExtremeValues() {
    console.log("🧪 測試極端值轉換...");
    
    const extremeCases = [
        {xBA: 0, xSLG: 0, xwOBA: 0},
        {xBA: 0.001, xSLG: 0.004, xwOBA: 0.031},
        {xBA: 1.0, xSLG: 4.0, xwOBA: 1.0}
    ];
    
    extremeCases.forEach((testCase, i) => {
        const attrs = calculatePlayerGameAttributes(testCase.xBA, testCase.xSLG, testCase.xwOBA);
        console.log(`案例 ${i+1}:`, testCase, '→', attrs);
    });
}

// 窗口全局函數
window.testExtremeValues = testExtremeValues;