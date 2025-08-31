/* ================================== */
/* 球員卡片模態視窗功能 */
/* ================================== */

// 球員卡翻轉功能
function flipCard() {
    const flipCard = document.querySelector('.flip-card');
    if (flipCard) {
        flipCard.classList.toggle('flipped');
    }
}

// 顯示球員卡模態視窗
function showPlayerCardModalNew(playerData, statsData, mode = 'attributesToStats') {
    let modal = document.getElementById('playerCardModal');
    if (!modal) {
        modal = createPlayerCardModal();
    }
    
    updatePlayerCardContent(modal, playerData, statsData, mode);
    modal.style.display = 'flex';
}

// 關閉球員卡模態視窗
function closePlayerCardModal() {
    const modal = document.getElementById('playerCardModal');
    if (modal) {
        modal.style.display = 'none';
        // 重設翻轉狀態
        const flipCard = modal.querySelector('.flip-card');
        if (flipCard) {
            flipCard.classList.remove('flipped');
        }
    }
}

// 創建球員卡模態視窗
function createPlayerCardModal() {
    const modalHtml = `
        <div class="modal-overlay" id="playerCardModal" style="display: none;">
            <div class="modal-content">
                <button class="close-btn" onclick="closePlayerCardModal()">×</button>
                <div class="modal-card-container">
                    <!-- 移動端翻轉卡片 -->
                    <div class="flip-card-container">
                        <div class="flip-card" onclick="flipCard()">
                            <div class="flip-card-front">
                                <div class="stats-card">
                                    <div class="stats-header">
                                        <div class="stats-title" id="playerCardName">球員名稱</div>
                                        <div class="stats-subtitle">📊 預測統計數據</div>
                                    </div>
                                    <div class="stats-grid" id="statsGrid">
                                        <!-- 統計數據將被動態包入 -->
                                    </div>
                                    <div class="flip-hint">
                                        點擊查看能力值
                                    </div>
                                </div>
                            </div>
                            <div class="flip-card-back">
                                <div id="playerCardBack">
                                    <!-- 球員卡將被動態包入 -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 桌面版兩欄佈局 -->
                    <div class="desktop-two-column">
                        <div class="desktop-stats-column">
                            <div class="desktop-stats-title" id="desktopPlayerName">預測統計數據</div>
                            <div class="desktop-stats-grid" id="desktopStatsGrid">
                                <!-- 桌面版統計數據將被動態包入 -->
                            </div>
                        </div>
                        <div class="desktop-card-column" id="desktopCardColumn">
                            <!-- 桌面版球員卡將被動態包入 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('playerCardModal');
}

// 更新球員卡內容
function updatePlayerCardContent(modal, playerData, statsData, mode = 'attributesToStats') {
    const isStatsToAttributes = mode === 'statsToAttributes';
    
    // 更新移動版翻轉卡片
    const playerName = modal.querySelector('#playerCardName');
    const statsGrid = modal.querySelector('#statsGrid');
    const cardBack = modal.querySelector('#playerCardBack');
    
    if (playerName && playerData.name) {
        playerName.textContent = playerData.name;
    }
    
    // Mobile flip card: ALWAYS put player card in cardBack, stats in statsGrid
    const statsSubtitle = modal.querySelector('.stats-subtitle');
    const flipHint = modal.querySelector('.flip-hint');
    
    // Both modes: ALWAYS put player card in cardBack, stats in statsGrid
    // The difference is just which content shows first (controlled by initial flip state)
    
    if (isStatsToAttributes) {
        // 計算OVR模式：想要正面顯示球員卡
        if (statsSubtitle) {
            statsSubtitle.textContent = '⚡ 球員能力值';
        }
        
        if (flipHint) {
            flipHint.textContent = '';
        }
        
        // Set card to show player card first (start flipped)
        const flipCard = modal.querySelector('.flip-card');
        if (flipCard) {
            flipCard.classList.add('flipped'); // Start flipped to show back (player card) first
        }
    } else {
        // 模擬數據模式：想要正面顯示統計數據
        if (statsSubtitle) {
            statsSubtitle.textContent = '📊 預測統計數據';
        }
        
        if (flipHint) {
            flipHint.textContent = '';
        }
        
        // Set card to show stats first (start unflipped)
        const flipCard = modal.querySelector('.flip-card');
        if (flipCard) {
            flipCard.classList.remove('flipped'); // Start unflipped to show front (stats) first
        }
    }
    
    // ALWAYS put stats in front (statsGrid), player card in back (cardBack)
    if (statsGrid && statsData) {
        let statsHtml = '';
        for (const [key, value] of Object.entries(statsData)) {
            const label = getStatLabel(key);
            if (label && value !== undefined) {
                statsHtml += `
                    <div class="stat-item">
                        <span class="stat-label">${label}</span>
                        <span class="stat-value">${formatStatValue(key, value)}</span>
                    </div>
                `;
            }
        }
        statsGrid.innerHTML = statsHtml;
    }
    
    if (cardBack && playerData) {
        const cardHtml = generatePlayerCardHTML(playerData);
        cardBack.innerHTML = cardHtml;
    }
    
    // 更新桌面版兩欄佈局
    const desktopPlayerName = modal.querySelector('#desktopPlayerName');
    const desktopStatsGrid = modal.querySelector('#desktopStatsGrid');
    const desktopCardColumn = modal.querySelector('#desktopCardColumn');
    
    // Desktop layout: ALWAYS put player card in desktopCardColumn, stats in desktopStatsGrid
    if (isStatsToAttributes) {
        // 計算OVR模式：左欄顯示三圍，右欄顯示數據
        if (desktopPlayerName) {
            desktopPlayerName.textContent = '球員能力值';
        }
        
        // 右欄顯示球員卡（三圍） - ALWAYS use desktopCardColumn for player cards
        if (desktopCardColumn && playerData) {
            const cardHtml = generatePlayerCardHTML(playerData);
            desktopCardColumn.innerHTML = cardHtml;
        }
        
        // 左欄顯示統計數據 - ALWAYS use desktopStatsGrid for stats
        if (desktopStatsGrid && statsData) {
            let desktopStatsHtml = '';
            for (const [key, value] of Object.entries(statsData)) {
                const label = getStatLabel(key);
                if (label && value !== undefined) {
                    desktopStatsHtml += `
                        <div class="desktop-stat-item">
                            <span class="desktop-stat-label">${label}</span>
                            <span class="desktop-stat-value">${formatStatValue(key, value)}</span>
                        </div>
                    `;
                }
            }
            desktopStatsGrid.innerHTML = desktopStatsHtml;
        }
    } else {
        // 模擬數據模式：左欄顯示數據，右欄顯示三圍
        if (desktopPlayerName) {
            desktopPlayerName.textContent = '預測統計數據';
        }
        
        // 左欄顯示統計數據 - ALWAYS use desktopStatsGrid for stats
        if (desktopStatsGrid && statsData) {
            let desktopStatsHtml = '';
            for (const [key, value] of Object.entries(statsData)) {
                const label = getStatLabel(key);
                if (label && value !== undefined) {
                    desktopStatsHtml += `
                        <div class="desktop-stat-item">
                            <span class="desktop-stat-label">${label}</span>
                            <span class="desktop-stat-value">${formatStatValue(key, value)}</span>
                        </div>
                    `;
                }
            }
            desktopStatsGrid.innerHTML = desktopStatsHtml;
        }
        
        // 右欄顯示球員卡（三圍） - ALWAYS use desktopCardColumn for player cards
        if (desktopCardColumn && playerData) {
            const cardHtml = generatePlayerCardHTML(playerData);
            desktopCardColumn.innerHTML = cardHtml;
        }
    }
}


// 從三圍計算OVR（如果沒有直接提供OVR值）
function calculateOVRFromAttributes(data) {
    const hit = data.HIT || 75;
    const pow = data.POW || 75;
    const eye = data.EYE || 75;
    
    // 簡單的OVR計算公式
    return Math.round((hit * 0.35) + (pow * 0.35) + (eye * 0.30));
}

// 統計數據標籤映射
function getStatLabel(key) {
    const labels = {
        'BA': '🏆 打擊率 (BA)',
        'OBP': '🎯 上壘率 (OBP)',
        'SLG': '🚀 長打率 (SLG)',
        'OPS': '✨ OPS',
        'wOBA': '🏆 wOBA',
        'HR': '⚾ 全壘打',
        'RBI': '🎯 RBI',
        'R': '🏃 得分',
        'SO': '❌ 三振',
        'BB': '🚶 保送'
    };
    return labels[key] || key;
}

// 格式化統計數值
function formatStatValue(key, value) {
    if (typeof value === 'number') {
        if (['BA', 'OBP', 'SLG', 'OPS', 'wOBA'].includes(key)) {
            return value.toFixed(3);
        }
        return Math.round(value).toString();
    }
    return value.toString();
}

// 生成球員卡HTML
function generatePlayerCardHTML(playerData) {
    const ovr = playerData.ovr || calculateOVRFromAttributes(playerData);
    const hit = playerData.HIT || 75;
    const pow = playerData.POW || 75;
    const eye = playerData.EYE || 75;
    
    return `
        <div class="player-card ${getRarityClass(ovr)}">
            <div class="card-background"></div>
            <div class="card-shine"></div>
            
            <div class="card-header">
                <div class="rarity-label">${getRarityLabel(ovr)}</div>
                <div class="player-name">${playerData.name || '無名球員'}</div>
            </div>
            
            <div class="ovr-section">
                <div class="ovr-number">${Math.round(ovr)}</div>
                <div class="ovr-label">OVERALL</div>
            </div>
            
            <div class="attributes-section">
                <div class="attributes-grid">
                    <div class="attribute-column">
                        <div class="attr-label">HIT</div>
                        <div class="attr-value">${Math.round(hit)}</div>
                    </div>
                    <div class="attribute-column">
                        <div class="attr-label">POW</div>
                        <div class="attr-value">${Math.round(pow)}</div>
                    </div>
                    <div class="attribute-column">
                        <div class="attr-label">EYE</div>
                        <div class="attr-value">${Math.round(eye)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 獲取稀有度類別
function getRarityClass(ovr) {
    if (ovr >= 110) return 'rarity-godlike';
    if (ovr >= 100) return 'rarity-mythic';
    if (ovr >= 90) return 'rarity-legendary';
    if (ovr >= 80) return 'rarity-epic';
    if (ovr >= 70) return 'rarity-rare';
    return 'rarity-common';
}

// 獲取稀有度標籤
function getRarityLabel(ovr) {
    if (ovr >= 110) return '神話';
    if (ovr >= 100) return '傳說';
    if (ovr >= 90) return '進化';
    if (ovr >= 80) return '精英';
    if (ovr >= 70) return '稀有';
    return '常見';
}

// 初始化球員卡事件監聽器
function initPlayerCardEvents() {
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('playerCardModal');
        if (modal && modal.style.display === 'flex' && e.target === modal) {
            closePlayerCardModal();
        }
    });
}

// 頁面載入時初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayerCardEvents);
} else {
    initPlayerCardEvents();
}

// 測試球員卡功能
function testPlayerCard() {
    const testPlayerData = {
        name: '先發打者',
        ovr: 78,
        HIT: 75,
        POW: 82,
        EYE: 77
    };
    
    const testStatsData = {
        'BA': 0.268,
        'OBP': 0.334,
        'SLG': 0.445,
        'OPS': 0.779,
        'wOBA': 0.312,
        'HR': 23,
        'RBI': 87,
        'R': 65,
        'SO': 145,
        'BB': 52
    };
    
    showPlayerCardModalNew(testPlayerData, testStatsData);
}