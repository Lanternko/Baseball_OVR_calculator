// main.js - 棒球數據轉換與頁面邏輯

// 從數據推算能力值 OVR 的主函式，用於「從數據推算能力」面板
function calculateAttributes() {
    // 取得輸入值，並處理浮點數
    const xBA = parseFloat(document.getElementById('xBA').value);
    const xSLG = parseFloat(document.getElementById('xSLG').value);
    const xOBP = parseFloat(document.getElementById('xOBP').value);

    console.log('原始輸入:', { xBA, xSLG, xOBP });

    // 處理無效輸入（NaN）並確保數值為正
    const safeXBA = isNaN(xBA) ? 0 : Math.max(0, xBA);
    const safeXSLG = isNaN(xSLG) ? 0 : Math.max(0, xSLG);
    const safeXOBP = isNaN(xOBP) ? 0 : Math.max(0, xOBP);

    console.log('安全處理後的輸入:', { safeXBA, safeXSLG, safeXOBP });

    // 進行數值範圍驗證
    if (safeXBA > 1 || safeXSLG > 4 || safeXOBP > 1) {
        alert('輸入數值超出合理範圍！請確認 BA/OBP ≤ 1.0, SLG ≤ 4.0');
        return;
    }

    const attributes = calculatePlayerGameAttributes(safeXBA, safeXSLG, safeXOBP);
    console.log('計算出的屬性:', attributes);

    const ovrResult = calculateBatterOVR(attributes.POW, attributes.HIT, attributes.EYE);
    console.log('OVR計算結果:', ovrResult);

    // 顯示結果
    document.getElementById('powResult').textContent = attributes.POW.toFixed(1);
    document.getElementById('hitResult').textContent = attributes.HIT.toFixed(1);
    document.getElementById('eyeResult').textContent = attributes.EYE.toFixed(1);
    document.getElementById('ovrFromStats').textContent = ovrResult.ovr;

    displayOVRBreakdown(ovrResult.breakdown, document.getElementById('ovrBreakdownStats'));

    document.getElementById('attributeResults').style.display = 'block';
}

// 從能力值模擬數據的主函式，用於「從能力模擬數據」面板
function calculateStats() {
    const pow = parseFloat(document.getElementById('inputPOW').value);
    const hit = parseFloat(document.getElementById('inputHIT').value);
    const eye = parseFloat(document.getElementById('inputEYE').value);
    const pa = parseInt(document.getElementById('inputPA').value);

    console.log('屬性輸入:', { pow, hit, eye, pa });

    // 處理無效輸入，提供預設值
    const safePOW = isNaN(pow) ? 70 : Math.max(0, pow);
    const safeHIT = isNaN(hit) ? 70 : Math.max(0, hit);
    const safeEYE = isNaN(eye) ? 70 : Math.max(0, eye);
    const safePA = isNaN(pa) ? 600 : Math.max(1, pa);

    if (safePOW > 500 || safeHIT > 500 || safeEYE > 500) {
        alert('屬性值不能超過500！');
        return;
    }

    // 執行模擬
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

// 設定輸入欄位的預設值
function setDefaultValues() {
    // 檢查欄位是否為空，是的話設定預設值
    const inputs = [
        { id: 'xBA', defaultVal: 0.280 },
        { id: 'xSLG', defaultVal: 0.450 },
        { id: 'xOBP', defaultVal: 0.350 },
        { id: 'inputPOW', defaultVal: 85 },
        { id: 'inputHIT', defaultVal: 75 },
        { id: 'inputEYE', defaultVal: 80 },
        { id: 'inputPA', defaultVal: 600 }
    ];

    inputs.forEach(input => {
        const element = document.getElementById(input.id);
        if (element && element.value === '') {
            element.value = input.defaultVal;
        }
    });
}

// 頁面載入時的事件監聽
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚾️ 網站主程式載入完成，初始化頁面與事件');

    // 為數據輸入欄位設置驗證規則
    ['xBA', 'xSLG', 'xOBP'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.step = '0.001';
            input.min = '0'; // 確保輸入值非負

            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                const maxVal = id === 'xSLG' ? 4 : 1;

                // 根據輸入值變更邊框顏色
                if (isNaN(value) || value < 0 || value > maxVal) {
                    this.style.borderColor = '#ff6b6b';
                } else {
                    this.style.borderColor = '#4ecdc4';
                }
            });
        }
    });

    // 為屬性輸入欄位設置驗證規則
    ['inputPOW', 'inputHIT', 'inputEYE'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.min = '0'; // 確保輸入值非負
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

// === 頁面改造：修改標題與標籤文字 ===
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 修改標題文字
        const fullTitle = document.querySelector('.full-title');
        const mobileTitle = document.querySelector('.mobile-title');
        if (fullTitle) fullTitle.textContent = '棒球OVR計算器';
        if (mobileTitle) mobileTitle.textContent = '棒球OVR計算器';

        // 導航標籤文字
        const tabBatter = document.getElementById('tabOVR');
        const tabPitcher = document.getElementById('tabSimulate');
        if (tabBatter) {
            tabBatter.textContent = '打者';
            tabBatter.onclick = function() {
                if (window.switchToMode) window.switchToMode('batter');
            };
        }
        if (tabPitcher) {
            tabPitcher.textContent = '投手';
            tabPitcher.onclick = function() {
                if (window.switchToMode) window.switchToMode('pitcher');
            };
        }

        // 移除舊的投手標籤
        const oldPitchers = document.getElementById('tabPitchers');
        if (oldPitchers && oldPitchers.parentElement) oldPitchers.parentElement.removeChild(oldPitchers);

        // 新增投手區塊（Coming Soon）
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !document.getElementById('pitcherCalculator')) {
            const section = document.createElement('div');
            section.className = 'calculator-section';
            section.id = 'pitcherCalculator';
            section.style.display = 'none';
            section.style.textAlign = 'center';
            section.innerHTML = '<div class="section-title">投手功能 (Coming Soon)</div>' +
                '<div class="gradient-divider"></div>' +
                '<p style="color: var(--text-secondary); margin-top: 12px;">此功能正在開發中，請稍後再試。</p>';
            mainContent.appendChild(section);
        }

        // 修改按鈕文字
        const left = document.getElementById('statsToAttributesCalculator');
        const right = document.getElementById('attributesToStatsCalculator');
        if (left) {
            const secondary = left.querySelector('.button-group .secondary-button');
            if (secondary) secondary.textContent = '使用預設值';
            const primary = Array.from(left.querySelectorAll('.button-group .button')).find(b => !b.classList.contains('secondary-button'));
            if (primary) primary.textContent = '計算OVR';
        }
        if (right) {
            const secondary = right.querySelector('.button-group .secondary-button');
            if (secondary) secondary.textContent = '使用預設值';
            const primary = Array.from(right.querySelectorAll('.button-group .button')).find(b => !b.classList.contains('secondary-button'));
            if (primary) primary.textContent = '模擬數據';
        }

    } catch (e) {
        console.warn('頁面修改時發生錯誤:', e);
    }
});

// 處理分頁切換邏輯
window.addEventListener('load', function() {
  window.switchToMode = function(mode) {
        const tabOVR = document.getElementById('tabOVR');
        const tabSim = document.getElementById('tabSimulate');
        const tabPit = document.getElementById('tabPitchers');
        const secOVR = document.getElementById('statsToAttributesCalculator');
        const secSIM = document.getElementById('attributesToStatsCalculator');
        const secPIT = document.getElementById('pitcherCalculator');

        const setActive = (target) => {
            [tabOVR, tabSim, tabPit].forEach(t => t && t.classList.remove('active'));
            if (target) target.classList.add('active');
        };
        const showOnly = (target) => {
            [secOVR, secSIM, secPIT].forEach(s => {
                if (s) s.style.display = (s === target) ? 'block' : 'none';
            });
        };

        switch (mode) {
            case 'statsToAttributes':
                setActive(tabOVR);
                showOnly(secOVR);
                break;
            case 'attributesToStats':
                setActive(tabSim);
                showOnly(secSIM);
                break;
            case 'pitcherAnalysis':
                setActive(tabPit);
                showOnly(secPIT);
                break;
            default:
                setActive(tabOVR);
                showOnly(secOVR);
        }

        try {
            if (typeof currentMode !== 'undefined') currentMode = mode;
        } catch (_) {}
  };
});

// 上層分頁：切換打者 / 投手
let currentTopTab = 'batter';
function showTopTab(tab) {
  const batterTabs = document.querySelectorAll('.panel-batter');
  const pitcherTabs = document.querySelectorAll('.panel-pitcher');
  const bBtn = document.getElementById('tabBatter');
  const pBtn = document.getElementById('tabPitcher');
  const show = (nodes, on) => nodes.forEach(n => { if(n) n.style.display = on ? 'block' : 'none'; });
  const setActive = (el, on) => { if(!el) return; if(on) el.classList.add('active'); else el.classList.remove('active'); };
  if (tab === 'pitcher') {
    show(batterTabs, false); show(pitcherTabs, true);
    setActive(bBtn, false); setActive(pBtn, true);
    currentTopTab = 'pitcher';
    document.body.classList.add('mode-pitcher');
    document.body.classList.remove('mode-batter');
  } else {
    show(batterTabs, true); show(pitcherTabs, false);
    setActive(bBtn, true); setActive(pBtn, false);
    currentTopTab = 'batter';
    document.body.classList.add('mode-batter');
    document.body.classList.remove('mode-pitcher');
  }
}
window.showTopTab = showTopTab;

// 確保頂部分頁存在（避免快取或舊版 HTML 未更新）
function ensureTopTabs() {
  const header = document.querySelector('.header .header-content');
  if (!header) return;
  let tabs = header.querySelector('.tab-buttons');
  if (!tabs) {
    tabs = document.createElement('div');
    tabs.className = 'tab-buttons';
    header.appendChild(tabs);
  }
  let tabB = document.getElementById('tabBatter');
  let tabP = document.getElementById('tabPitcher');
  if (!tabB) {
    tabB = document.createElement('button');
    tabB.id = 'tabBatter';
    tabB.className = 'tab-btn active';
    tabB.textContent = '打者';
    tabB.onclick = function(){ showTopTab('batter'); };
    tabs.appendChild(tabB);
  }
  if (!tabP) {
    tabP = document.createElement('button');
    tabP.id = 'tabPitcher';
    tabP.className = 'tab-btn';
    tabP.textContent = '投手';
    tabP.onclick = function(){ showTopTab('pitcher'); };
    tabs.appendChild(tabP);
  }
  // 保證能見
  tabs.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function(){
  ensureTopTabs();
  // 預設顯示打者分頁
  try { showTopTab('batter'); } catch(e) {}
});

// 視窗改變大小時，維持目前上層分頁狀態
window.addEventListener('resize', function(){
  try { showTopTab(currentTopTab || 'batter'); } catch(e) {}
});

// 投手：預設與卡片顯示（支援前綴 p1 / p2）
function useDefaultPitcherValues(prefix='') {
  const id = k => (prefix? `${prefix}${k}` : k);
  const set = (k,val)=>{ const el=document.getElementById(id(k)); if(el){ el.value=val; } };
  set('Name','投手範例');
  set('CTRL',70); set('K',85); set('STUFF',85); set('SUPP',70);
}
function calculateAndShowPitcherCard(prefix='') {
  const id = k => (prefix? `${prefix}${k}` : k);
  const name = (document.getElementById(id('Name'))?.value || '投手');

  // 若為 p1：輸入為統計（BB%、K%、被BA、被SLG）→ 反推屬性
  let attrs;
  if (document.getElementById(id('BB'))) {
    const BB = parseFloat(document.getElementById(id('BB'))?.value);
    const Kp = parseFloat(document.getElementById(id('Kp'))?.value);
    const BA = parseFloat(document.getElementById(id('BA'))?.value);
    const SLG = parseFloat(document.getElementById(id('SLG'))?.value);
    const s = v => (isNaN(v)?0:v);
    if (typeof reverseInterpolate !== 'function' || typeof PITCHER_CONTROL_TABLE === 'undefined') {
      alert('常數或工具未載入，請確認 constants.js');
      return;
    }
    attrs = {
      CONTROL: reverseInterpolate(s(BB), PITCHER_CONTROL_TABLE),
      STRIKEOUT: reverseInterpolate(s(Kp), PITCHER_STRIKEOUT_TABLE),
      STUFF: reverseInterpolate(s(BA), PITCHER_STUFF_TABLE),
      SUPPRESSION: reverseInterpolate(s(SLG), PITCHER_SUPPRESSION_TABLE)
    };
  } else {
    // p2：輸入為屬性（既有邏輯）
    const CONTROL = parseFloat(document.getElementById(id('CTRL'))?.value);
    const STRIKEOUT = parseFloat(document.getElementById(id('K'))?.value);
    const STUFF = parseFloat(document.getElementById(id('STUFF'))?.value);
    const SUPPRESSION = parseFloat(document.getElementById(id('SUPP'))?.value);
    const safe = v => (isNaN(v)?70:Math.max(0,Math.min(500,v)));
    attrs = { CONTROL: safe(CONTROL), STRIKEOUT: safe(STRIKEOUT), STUFF: safe(STUFF), SUPPRESSION: safe(SUPPRESSION) };
  }

  if (typeof computePitcherOVR !== 'function' || typeof pitcherAttrsToStats !== 'function') { alert('constants.js 未載入'); return; }
  const ovr = computePitcherOVR(attrs);
  const s = pitcherAttrsToStats(attrs);
  const obp = (s.BB + s.BA*(1 - s.BB));
  const ops = obp + s.SLG;
  const playerData = {
    name, ovr,
    CONTROL: Math.round(attrs.CONTROL),
    STRIKEOUT: Math.round(attrs.STRIKEOUT),
    STUFF: Math.round(attrs.STUFF),
    SUPPRESSION: Math.round(attrs.SUPPRESSION)
  };
  const statsData = {
    'K%': s.K,           // 三振率
    'BB%': s.BB,         // 保送率
    'BAA': s.BA,         // 被打擊率
    'SLGA': s.SLG        // 被長打率
  };
  if (window.showPlayerCardModalNew) window.showPlayerCardModalNew(playerData, statsData, 'pitcher');
}
window.useDefaultPitcherValues = useDefaultPitcherValues;
window.calculateAndShowPitcherCard = calculateAndShowPitcherCard;

// p1 預設（統計版）
function useDefaultPitcherStatDefaults(prefix='p1'){
  const id = k => (prefix? `${prefix}${k}` : k);
  const set=(k,v)=>{ const el=document.getElementById(id(k)); if(el){ el.value=v; } };
  set('Name','投手範例');
  set('BB',0.085); set('Kp',0.225); set('BA',0.242); set('SLG',0.385);
}
window.useDefaultPitcherStatDefaults = useDefaultPitcherStatDefaults;


// ===== 投手頁：預設值與卡片顯示 =====
function useDefaultPitcherValues() {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
        }
    };
    set('pitcherName', '投手範例');
    set('inputCTRL', 70);
    set('inputK', 85);
    set('inputSTUFF', 85);
    set('inputSUPP', 70);
}

function calculateAndShowPitcherCard() {
    const name = (document.getElementById('pitcherName')?.value || '投手');
    const CONTROL = parseFloat(document.getElementById('inputCTRL')?.value);
    const STRIKEOUT = parseFloat(document.getElementById('inputK')?.value);
    const STUFF = parseFloat(document.getElementById('inputSTUFF')?.value);
    const SUPPRESSION = parseFloat(document.getElementById('inputSUPP')?.value);

    const safe = v => (isNaN(v) ? 70 : Math.max(0, Math.min(500, v)));
    const attrs = {
        CONTROL: safe(CONTROL),
        STRIKEOUT: safe(STRIKEOUT),
        STUFF: safe(STUFF),
        SUPPRESSION: safe(SUPPRESSION)
    };

    if (typeof computePitcherOVR !== 'function' || typeof pitcherAttrsToStats !== 'function') {
        alert('常數或轉換尚未載入，請確認 constants.js');
        return;
    }

    const ovr = computePitcherOVR(attrs);
    const s = pitcherAttrsToStats(attrs); // {BB,K,BA,SLG}
    const obp = (s.BB + s.BA * (1 - s.BB));
    const ops = obp + s.SLG;

    const playerData = {
        name: name,
        ovr: ovr,
        CONTROL: Math.round(attrs.CONTROL),
        STRIKEOUT: Math.round(attrs.STRIKEOUT),
        STUFF: Math.round(attrs.STUFF),
        SUPPRESSION: Math.round(attrs.SUPPRESSION)
    };
    const statsData = {
        'K%': s.K,           // 三振率
        'BB%': s.BB,         // 保送率
        'BAA': s.BA,         // 被打擊率
        'SLGA': s.SLG        // 被長打率
    };

    if (window.showPlayerCardModalNew) {
        window.showPlayerCardModalNew(playerData, statsData, 'pitcher');
    }
}

window.useDefaultPitcherValues = useDefaultPitcherValues;
window.calculateAndShowPitcherCard = calculateAndShowPitcherCard;
