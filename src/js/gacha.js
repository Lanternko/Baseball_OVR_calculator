// gacha.js - 抽卡系統核心邏輯
console.log('🎴 載入抽卡系統...');

// 用戶數據管理
class GachaUserData {
    constructor() {
        this.storageKey = 'baseball_gacha_user_data';
        this.defaultData = {
            currency: 100000000, // 測試階段增加鑽石
            collection: [], // 收藏的卡片實例
            pullHistory: [],
            lastLogin: Date.now(),
            dailyCheckIn: {
                lastCheckIn: 0,
                streak: 0
            },
            missions: {
                dailyPulls: 0,
                lastMissionReset: Date.now()
            }
        };
    }
    
    // 載入用戶數據
    loadUserData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                // 合併預設值以防新欄位
                return { ...this.defaultData, ...data };
            }
        } catch (error) {
            console.error('載入用戶數據失敗:', error);
        }
        return { ...this.defaultData };
    }
    
    // 儲存用戶數據  
    saveUserData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('儲存用戶數據失敗:', error);
            return false;
        }
    }
    
    // 獲取貨幣
    getCurrency() {
        const data = this.loadUserData();
        return data.currency;
    }
    
    // 增加貨幣
    addCurrency(amount) {
        const data = this.loadUserData();
        data.currency += amount;
        this.saveUserData(data);
        return true;
    }
    
    // 消費貨幣
    spendCurrency(amount) {
        const data = this.loadUserData();
        if (data.currency >= amount) {
            data.currency -= amount;
            this.saveUserData(data);
            return true;
        }
        return false;
    }
    
    // 增加卡片到收藏
    addToCollection(cardInstance) {
        const data = this.loadUserData();
        data.collection.push(cardInstance);
        data.pullHistory.push({
            timestamp: Date.now(),
            cardId: cardInstance.id,
            rarity: cardInstance.rarity
        });
        this.saveUserData(data);
    }
    
    // 獲取收藏統計
    getCollectionStats() {
        const data = this.loadUserData();
        const total = data.collection.length;
        const legendary = data.collection.filter(card => 
            ['legendary', 'mythic', 'godlike'].includes(card.rarity)
        ).length;
        
        const uniqueCards = new Set(data.collection.map(card => card.playerId)).size;
        const completionRate = Math.round((uniqueCards / PLAYER_DATABASE.length) * 100);
        
        return { total, legendary, completionRate };
    }
    
    // 每日簽到
    dailyCheckIn() {
        const data = this.loadUserData();
        const today = new Date().toDateString();
        const lastCheckIn = new Date(data.dailyCheckIn.lastCheckIn).toDateString();
        
        if (today === lastCheckIn) {
            return { success: false, message: '今日已簽到!' };
        }
        
        // 檢查連續簽到
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = yesterday.toDateString() === lastCheckIn;
        
        if (wasYesterday) {
            data.dailyCheckIn.streak += 1;
        } else {
            data.dailyCheckIn.streak = 1;
        }
        
        data.dailyCheckIn.lastCheckIn = Date.now();
        
        // 簽到獎勵 (連續簽到有額外獎勵)
        const baseReward = 100;
        const streakBonus = Math.min(data.dailyCheckIn.streak * 20, 200);
        const reward = baseReward + streakBonus;
        
        data.currency += reward;
        this.saveUserData(data);
        
        return { 
            success: true, 
            reward: reward, 
            streak: data.dailyCheckIn.streak,
            message: `獲得 ${reward} 鑽石! 連續簽到 ${data.dailyCheckIn.streak} 天`
        };
    }
    
    // 檢查並重置每日任務
    checkDailyMissions() {
        const data = this.loadUserData();
        const today = new Date().toDateString();
        const lastReset = new Date(data.missions.lastMissionReset).toDateString();
        
        if (today !== lastReset) {
            data.missions.dailyPulls = 0;
            data.missions.lastMissionReset = Date.now();
            this.saveUserData(data);
        }
        
        return data.missions;
    }
    
    // 完成抽卡任務
    completePullMission(pullCount) {
        const data = this.loadUserData();
        data.missions.dailyPulls += pullCount;
        
        let reward = 0;
        // 每日抽卡任務獎勵
        if (data.missions.dailyPulls >= 5 && data.missions.dailyPulls - pullCount < 5) {
            reward += 200; // 完成5次抽卡
        }
        if (data.missions.dailyPulls >= 10 && data.missions.dailyPulls - pullCount < 10) {
            reward += 300; // 完成10次抽卡
        }
        
        if (reward > 0) {
            data.currency += reward;
            this.saveUserData(data);
            return { success: true, reward: reward };
        }
        
        this.saveUserData(data);
        return { success: false };
    }
}

// 抽卡邏輯類
class GachaSystem {
    constructor() {
        this.userData = new GachaUserData();
        this.guaranteedRare = false; // 十連抽保底
    }
    
    // 根據機率選擇稀有度
    selectRarity(isGuaranteed = false) {
        if (isGuaranteed) {
            // 保底：至少稀有級別
            const guaranteedRarities = ['rare', 'epic', 'legendary', 'mythic', 'godlike'];
            const weights = [0.70, 0.20, 0.08, 0.015, 0.005]; // 保底權重
            return this.weightedRandomSelect(guaranteedRarities, weights);
        }
        
        // 一般抽卡機率
        const random = Math.random();
        let cumulative = 0;
        
        for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
            cumulative += config.probability;
            if (random <= cumulative) {
                return rarity;
            }
        }
        
        return 'common'; // 保底
    }
    
    // 權重隨機選擇
    weightedRandomSelect(items, weights) {
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }
    
    // 根據稀有度選擇球員
    selectPlayer(targetRarity) {
        const availablePlayers = PLAYER_DATABASE.filter(player => 
            player.rarity === targetRarity
        );
        
        if (availablePlayers.length === 0) {
            console.warn(`沒有找到 ${targetRarity} 稀有度的球員`);
            return PLAYER_DATABASE[0]; // 回退到第一個球員
        }
        
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        return availablePlayers[randomIndex];
    }
    
    // 計算球員屬性
    calculatePlayerAttributes(player) {
        try {
            // 使用逆向工程系統計算屬性
            const targetStats = {
                BA: player.realStats.BA,
                OBP: player.realStats.OBP,
                SLG: player.realStats.SLG,
                PA: 600
            };
            
            const result = quickEstimateAttributes(targetStats);
            return {
                POW: result.POW,
                HIT: result.HIT,
                EYE: result.EYE,
                OVR: result.OVR
            };
        } catch (error) {
            console.warn('屬性計算失敗，使用備用方法:', error);
            // 備用：基於稀有度的屬性範圍
            const range = RARITY_CONFIG[player.rarity].ovrRange;
            const ovr = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
            
            return {
                POW: Math.floor(ovr * 0.85 + Math.random() * 30),
                HIT: Math.floor(ovr * 0.90 + Math.random() * 20), 
                EYE: Math.floor(ovr * 0.80 + Math.random() * 40),
                OVR: ovr
            };
        }
    }
    
    // 創建卡片實例
    createCardInstance(player) {
        const attributes = this.calculatePlayerAttributes(player);
        const cardInstance = {
            instanceId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: player.id,
            name: player.name,
            nameEn: player.nameEn,
            team: player.team,
            position: player.position,
            era: player.era,
            rarity: player.rarity,
            cardType: player.cardType,
            description: player.description,
            attributes: attributes,
            realStats: player.realStats,
            pullTime: Date.now()
        };
        
        return cardInstance;
    }
    
    // 執行單次抽卡
    performSinglePull(isGuaranteed = false) {
        const rarity = this.selectRarity(isGuaranteed);
        const player = this.selectPlayer(rarity);
        const cardInstance = this.createCardInstance(player);
        
        console.log(`🎊 抽到: ${player.name} (${RARITY_CONFIG[rarity].name})`);
        return cardInstance;
    }
    
    // 執行多次抽卡
    performMultiplePulls(count) {
        const results = [];
        let hasRareOrBetter = false;
        
        // 先抽前9張
        for (let i = 0; i < count - 1; i++) {
            const card = this.performSinglePull(false);
            results.push(card);
            
            if (['rare', 'epic', 'legendary', 'mythic', 'godlike'].includes(card.rarity)) {
                hasRareOrBetter = true;
            }
        }
        
        // 最後一張：如果沒有稀有以上，保底稀有
        const isLastCardGuaranteed = (count === 10) && !hasRareOrBetter;
        const lastCard = this.performSinglePull(isLastCardGuaranteed);
        results.push(lastCard);
        
        return results;
    }
}

// 全域抽卡系統實例
let gachaSystem;
let userData;

// 初始化抽卡系統
function initializeGacha() {
    gachaSystem = new GachaSystem();
    userData = gachaSystem.userData;
    
    updateUI();
    console.log('✅ 抽卡系統初始化完成');
}

// 更新UI顯示
function updateUI() {
    // 更新貨幣顯示
    const currencyElement = document.getElementById('userCurrency');
    if (currencyElement) {
        currencyElement.textContent = userData.getCurrency();
    }
    
    // 更新按鈕狀態
    updateButtonStates();
    
    // 更新收藏統計
    updateCollectionStats();
    
    // 更新簽到按鈕狀態
    updateCheckInButton();
    
    // 檢查每日任務
    userData.checkDailyMissions();
}

// 更新按鈕狀態
function updateButtonStates() {
    const currency = userData.getCurrency();
    const singleBtn = document.getElementById('singlePullBtn');
    const multiBtn = document.getElementById('multiPullBtn');
    
    if (singleBtn) {
        singleBtn.disabled = currency < 100;
    }
    
    if (multiBtn) {
        multiBtn.disabled = currency < 900;
    }
}

// 更新收藏統計
function updateCollectionStats() {
    const stats = userData.getCollectionStats();
    
    const totalElement = document.getElementById('totalCards');
    const legendaryElement = document.getElementById('legendaryCards');
    const completionElement = document.getElementById('completionRate');
    
    if (totalElement) totalElement.textContent = stats.total;
    if (legendaryElement) legendaryElement.textContent = stats.legendary;
    if (completionElement) completionElement.textContent = stats.completionRate + '%';
}

// 執行抽卡
function performGachaPull(count) {
    const cost = count === 1 ? 100 : 900;
    
    // 檢查貨幣
    if (!userData.spendCurrency(cost)) {
        // 如果鑽石不足，提示獲取方法
        showInsufficientCurrencyModal();
        return;
    }
    
    // 顯示抽卡動畫
    showPullAnimation();
    
    setTimeout(() => {
        // 執行抽卡邏輯
        const results = count === 1 ? 
            [gachaSystem.performSinglePull()] : 
            gachaSystem.performMultiplePulls(count);
        
        // 將結果加入收藏
        results.forEach(card => userData.addToCollection(card));
        
        // 檢查抽卡任務獎勵
        const missionReward = userData.completePullMission(count);
        if (missionReward.success) {
            setTimeout(() => {
                alert(`🎉 完成抽卡任務！獲得 ${missionReward.reward} 鑽石！`);
                updateUI();
            }, 1000);
        }
        
        // 顯示結果
        showPullResults(results);
        
        // 更新UI
        updateUI();
        
    }, 2000); // 2秒動畫時間
}

// 顯示鑽石不足的模態框
function showInsufficientCurrencyModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center; padding: 30px;">
            <h3 style="color: var(--text-primary); margin-bottom: 20px;">💎 鑽石不足</h3>
            <p style="color: var(--text-secondary); margin-bottom: 25px;">
                需要更多鑽石才能抽卡！<br>
                試試以下方法獲得免費鑽石：
            </p>
            <div style="text-align: left; margin-bottom: 25px;">
                <div style="margin-bottom: 10px;">📅 每日簽到：100-300 鑽石</div>
                <div style="margin-bottom: 10px;">🎯 完成任務：200-500 鑽石</div>
                <div style="margin-bottom: 10px;">🎁 新手福利：重置遊戲獲得 1500 鑽石</div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="addFreeDiamonds()" class="continue-btn" style="background: var(--accent-primary);">
                    🎁 獲得 500 鑽石
                </button>
                <button onclick="closeInsufficientModal()" class="continue-btn" style="background: var(--text-muted);">
                    關閉
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    window.currentInsufficientModal = modal;
}

// 關閉鑽石不足模態框
function closeInsufficientModal() {
    if (window.currentInsufficientModal) {
        document.body.removeChild(window.currentInsufficientModal);
        window.currentInsufficientModal = null;
    }
}

// 添加免費鑽石（每天一次）
function addFreeDiamonds() {
    const lastFreeGift = localStorage.getItem('lastFreeGift');
    const today = new Date().toDateString();
    
    if (lastFreeGift === today) {
        alert('今天已經領取過免費鑽石了！明天再來吧！');
        return;
    }
    
    userData.addCurrency(500);
    localStorage.setItem('lastFreeGift', today);
    updateUI();
    closeInsufficientModal();
    alert('🎉 獲得 500 鑽石！');
}

// 每日簽到功能
function performDailyCheckIn() {
    const result = userData.dailyCheckIn();
    const btn = document.getElementById('checkInBtn');
    
    if (result.success) {
        alert(result.message);
        btn.textContent = '✅ 已簽到';
        btn.classList.add('checked-in');
        btn.disabled = true;
        updateUI();
    } else {
        alert(result.message);
    }
}

// 更新簽到按鈕狀態
function updateCheckInButton() {
    const btn = document.getElementById('checkInBtn');
    const data = userData.loadUserData();
    const today = new Date().toDateString();
    const lastCheckIn = new Date(data.dailyCheckIn.lastCheckIn).toDateString();
    
    if (today === lastCheckIn) {
        btn.textContent = '✅ 已簽到';
        btn.classList.add('checked-in');
        btn.disabled = true;
    } else {
        btn.textContent = '📅 每日簽到';
        btn.classList.remove('checked-in');
        btn.disabled = false;
    }
}

// 顯示抽卡動畫
function showPullAnimation() {
    const animation = document.getElementById('pullAnimation');
    const results = document.getElementById('pullResults');
    
    if (animation) {
        animation.style.display = 'block';
        results.style.display = 'none';
        
        // 滾動到動畫位置
        animation.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 顯示抽卡結果
function showPullResults(cards) {
    const animation = document.getElementById('pullAnimation');
    const results = document.getElementById('pullResults');
    const grid = document.getElementById('resultGrid');
    
    if (!results || !grid) return;
    
    // 隱藏動畫，顯示結果
    animation.style.display = 'none';
    results.style.display = 'block';
    
    // 設定網格樣式
    if (cards.length === 1) {
        grid.className = 'result-grid single';
    } else {
        grid.className = 'result-grid';
    }
    
    // 生成卡片HTML
    grid.innerHTML = cards.map((card, index) => {
        // 為顯示生成完整的球員數據
        const playerData = {
            name: card.name,
            ovr: card.attributes.OVR,
            HIT: card.attributes.HIT,
            POW: card.attributes.POW,
            EYE: card.attributes.EYE
        };
        
        // 創建統計數據用於模態視窗
        const statsData = {
            BA: card.realStats.BA,
            OBP: card.realStats.OBP,
            SLG: card.realStats.SLG,
            OPS: card.realStats.OBP + card.realStats.SLG,
            wOBA: calculateSimpleWOBA(card.realStats)
        };
        
        return `
            <div class="result-card" style="--index: ${index}" onclick="showCardDetails('${card.instanceId}')">
                <div class="rarity-indicator rarity-${card.rarity}">
                    ${RARITY_CONFIG[card.rarity].name}
                </div>
                ${generatePlayerCardHTML(playerData)}
                <div style="text-align: center; margin-top: 10px; color: var(--text-secondary); font-size: 0.9em;">
                    ${card.team} · ${card.position} · ${card.era}
                </div>
                <div style="text-align: center; margin-top: 5px; font-size: 0.8em; color: var(--accent-primary);">
                    點擊查看詳細資料
                </div>
            </div>
        `;
    }).join('');
    
    // 儲存卡片數據供模態視窗使用
    window.currentPullResults = cards;
    
    // 滾動到結果位置
    results.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 關閉抽卡結果
function closePullResults() {
    const results = document.getElementById('pullResults');
    if (results) {
        results.style.display = 'none';
    }
}

// 查看完整收藏（暫時用alert，之後可以做專門的收藏頁面）
function viewFullCollection() {
    const data = userData.loadUserData();
    const collection = data.collection;
    
    if (collection.length === 0) {
        alert('你還沒有任何卡片！快去抽卡吧！');
        return;
    }
    
    // 統計各稀有度數量
    const rarityCount = {};
    collection.forEach(card => {
        rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
    });
    
    let message = `🎴 你的收藏 (${collection.length} 張卡片):\n\n`;
    
    for (const [rarity, count] of Object.entries(rarityCount)) {
        const config = RARITY_CONFIG[rarity];
        message += `${config.name}: ${count} 張\n`;
    }
    
    alert(message);
}

// 簡化版 wOBA 計算
function calculateSimpleWOBA(stats) {
    // 簡化的 wOBA 估算：基於 OBP 和 SLG
    return (stats.OBP * 0.7 + stats.SLG * 0.3);
}

// 顯示卡片詳細資料
function showCardDetails(instanceId) {
    if (!window.currentPullResults) return;
    
    const card = window.currentPullResults.find(c => c.instanceId === instanceId);
    if (!card) return;
    
    const playerData = {
        name: card.name,
        ovr: card.attributes.OVR,
        HIT: card.attributes.HIT,
        POW: card.attributes.POW,
        EYE: card.attributes.EYE
    };
    
    const statsData = {
        BA: card.realStats.BA,
        OBP: card.realStats.OBP,
        SLG: card.realStats.SLG,
        OPS: (card.realStats.OBP + card.realStats.SLG),
        wOBA: calculateSimpleWOBA(card.realStats)
    };
    
    // 使用主系統的球員卡模態視窗
    if (typeof showPlayerCardModalNew !== 'undefined') {
        showPlayerCardModalNew(playerData, statsData, 'statsToAttributes');
    } else {
        // 備用：顯示基本資訊
        const info = `
球員：${card.name}
隊伍：${card.team}
位置：${card.position}
年代：${card.era}
稀有度：${RARITY_CONFIG[card.rarity].name}

屬性：
- POW: ${card.attributes.POW}
- HIT: ${card.attributes.HIT}  
- EYE: ${card.attributes.EYE}
- OVR: ${card.attributes.OVR}

真實數據：
- BA: ${card.realStats.BA.toFixed(3)}
- OBP: ${card.realStats.OBP.toFixed(3)}
- SLG: ${card.realStats.SLG.toFixed(3)}
        `;
        alert(info);
    }
}

// 測試用：手動增加鑽石函數
function addCurrency(amount) {
    if (!userData) {
        console.error('用戶數據未初始化');
        return;
    }
    userData.addCurrency(amount);
    updateUI();
    console.log(`✅ 增加了 ${amount} 鑽石`);
}

// 導出到全域作用域
if (typeof window !== 'undefined') {
    window.initializeGacha = initializeGacha;
    window.performGachaPull = performGachaPull;
    window.closePullResults = closePullResults;
    window.viewFullCollection = viewFullCollection;
    window.showCardDetails = showCardDetails;
    window.calculateSimpleWOBA = calculateSimpleWOBA;
    window.performDailyCheckIn = performDailyCheckIn;
    window.addFreeDiamonds = addFreeDiamonds;
    window.closeInsufficientModal = closeInsufficientModal;
    window.addCurrency = addCurrency; // 測試用函數
    
    console.log('✅ 抽卡功能載入完成');
}