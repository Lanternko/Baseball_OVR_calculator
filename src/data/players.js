// players.js - 球員資料庫
// 包含現役頂尖球員和歷史傳奇球員的基本數據

console.log('📊 載入球員資料庫...');

// 球員資料庫 - 2025年真實數據
const PLAYER_DATABASE = [
    // ===== 2025年頂尖球員 (基於真實數據) =====
    {
        id: "aaron_judge_2025",
        name: "艾倫·賈吉",
        nameEn: "Aaron Judge",
        team: "紐約洋基",
        position: "RF",
        era: "2025賽季",
        realStats: { BA: 0.324, SLG: 0.674, OBP: 0.443, wOBA: 0.453 },
        rarity: "godlike",
        cardType: "active",
        description: "2025年打擊三冠王候選人，驚人的長打能力"
    },
    {
        id: "jacob_wilson_jr_2025",
        name: "小雅各布·威爾森",
        nameEn: "Jacob Wilson Jr.",
        team: "奧克蘭運動家",
        position: "SS",
        era: "2025賽季",
        realStats: { BA: 0.318, SLG: 0.456, OBP: 0.358, wOBA: 0.353 },
        rarity: "legendary",
        cardType: "active",
        description: "新秀游擊手，展現出色的打擊天賦"
    },
    {
        id: "jonathan_aranda_2025",
        name: "強納森·阿蘭達",
        nameEn: "Jonathan Aranda",
        team: "坦帕灣光芒",
        position: "1B/2B",
        era: "2025賽季",
        realStats: { BA: 0.316, SLG: 0.478, OBP: 0.394, wOBA: 0.377 },
        rarity: "legendary",
        cardType: "active",
        description: "多位置防守，穩定的打擊表現"
    },
    {
        id: "miguel_andujar_2025",
        name: "米格爾·安杜哈",
        nameEn: "Miguel Andujar",
        team: "邁阿密馬林魚",
        position: "3B/OF",
        era: "2025賽季",
        realStats: { BA: 0.313, SLG: 0.472, OBP: 0.352, wOBA: 0.355 },
        rarity: "epic",
        cardType: "active",
        description: "重返巔峰的多面手球員"
    },
    {
        id: "bo_bichette_2025",
        name: "博·比謝特",
        nameEn: "Bo Bichette",
        team: "多倫多藍鳥",
        position: "SS",
        era: "2025賽季",
        realStats: { BA: 0.310, SLG: 0.478, OBP: 0.354, wOBA: 0.358 },
        rarity: "epic",
        cardType: "active",
        description: "藍鳥核心游擊手，攻守俱佳"
    },
    {
        id: "nick_kurtz_2025",
        name: "尼克·科茲",
        nameEn: "Nick Kurtz",
        team: "奧克蘭運動家",
        position: "1B",
        era: "2025賽季",
        realStats: { BA: 0.308, SLG: 0.632, OBP: 0.402, wOBA: 0.432 },
        rarity: "mythic",
        cardType: "active",
        description: "新秀強打者，恐怖的長打火力"
    },
    {
        id: "jake_meyers_2025",
        name: "傑克·邁爾斯",
        nameEn: "Jake Meyers",
        team: "休士頓太空人",
        position: "OF",
        era: "2025賽季",
        realStats: { BA: 0.308, SLG: 0.405, OBP: 0.369, wOBA: 0.341 },
        rarity: "rare",
        cardType: "active",
        description: "太空人外野新星，上壘能力出色"
    },
    {
        id: "jeremy_pena_2025",
        name: "傑瑞米·佩納",
        nameEn: "Jeremy Peña",
        team: "休士頓太空人",
        position: "SS",
        era: "2025賽季",
        realStats: { BA: 0.307, SLG: 0.476, OBP: 0.366, wOBA: 0.364 },
        rarity: "epic",
        cardType: "active",
        description: "世界大賽MVP，關鍵時刻的英雄"
    },
    {
        id: "trea_turner_2025",
        name: "特雷亞·特納",
        nameEn: "Trea Turner",
        team: "費城費城人",
        position: "SS",
        era: "2025賽季",
        realStats: { BA: 0.301, SLG: 0.453, OBP: 0.353, wOBA: 0.349 },
        rarity: "epic",
        cardType: "active",
        description: "費城人的速度機器，攻守兼備"
    },
    {
        id: "george_springer_iii_2025",
        name: "喬治·史普林格三世",
        nameEn: "George Springer III",
        team: "多倫多藍鳥",
        position: "CF",
        era: "2025賽季",
        realStats: { BA: 0.300, SLG: 0.533, OBP: 0.391, wOBA: 0.396 },
        rarity: "legendary",
        cardType: "active",
        description: "經驗豐富的中堅手，長打威脅"
    },
    {
        id: "freddie_freeman_2025",
        name: "佛萊迪·弗里曼",
        nameEn: "Freddie Freeman",
        team: "洛杉磯道奇",
        position: "1B",
        era: "2025賽季",
        realStats: { BA: 0.300, SLG: 0.500, OBP: 0.374, wOBA: 0.373 },
        rarity: "legendary",
        cardType: "active",
        description: "道奇一壘手，穩定的核心打者"
    },
    {
        id: "maikel_garcia_2025",
        name: "麥克爾·加西亞",
        nameEn: "Maikel Garcia",
        team: "堪薩斯市皇家",
        position: "3B",
        era: "2025賽季",
        realStats: { BA: 0.298, SLG: 0.475, OBP: 0.361, wOBA: 0.361 },
        rarity: "rare",
        cardType: "active",
        description: "皇家隊三壘手，全面的攻擊能力"
    },
    {
        id: "sal_frelick_2025",
        name: "薩爾·弗雷利克",
        nameEn: "Sal Frelick",
        team: "密爾瓦基釀酒人",
        position: "OF",
        era: "2025賽季",
        realStats: { BA: 0.298, SLG: 0.411, OBP: 0.360, wOBA: 0.339 },
        rarity: "rare",
        cardType: "active",
        description: "釀酒人外野手，接觸型打者"
    },
    {
        id: "bobby_witt_jr_2025",
        name: "小巴比·威特",
        nameEn: "Bobby Witt Jr.",
        team: "堪薩斯市皇家",
        position: "SS",
        era: "2025賽季",
        realStats: { BA: 0.296, SLG: 0.501, OBP: 0.353, wOBA: 0.361 },
        rarity: "legendary",
        cardType: "active",
        description: "皇家隊未來之星，五工具球員"
    },
    {
        id: "alejandro_kirk_2025",
        name: "亞歷杭德羅·柯克",
        nameEn: "Alejandro Kirk",
        team: "多倫多藍鳥",
        position: "C",
        era: "2025賽季",
        realStats: { BA: 0.295, SLG: 0.420, OBP: 0.360, wOBA: 0.340 },
        rarity: "rare",
        cardType: "active",
        description: "藍鳥主戰捕手，出色的選球眼"
    },
    {
        id: "will_smith_2025",
        name: "威爾·史密斯",
        nameEn: "Will Smith",
        team: "洛杉磯道奇",
        position: "C",
        era: "2025賽季",
        realStats: { BA: 0.293, SLG: 0.497, OBP: 0.404, wOBA: 0.390 },
        rarity: "legendary",
        cardType: "active",
        description: "道奇主戰捕手，攻守兼備的明星"
    },
    {
        id: "ramon_laureano_2025",
        name: "拉蒙·勞雷亞諾",
        nameEn: "Ramón Laureano",
        team: "亞特蘭大勇士",
        position: "CF",
        era: "2025賽季",
        realStats: { BA: 0.293, SLG: 0.541, OBP: 0.354, wOBA: 0.380 },
        rarity: "epic",
        cardType: "active",
        description: "勇士外野手，強勁的長打能力"
    },
    {
        id: "tyler_freeman_2025",
        name: "泰勒·弗里曼",
        nameEn: "Tyler Freeman",
        team: "克里夫蘭守護者",
        position: "2B/SS",
        era: "2025賽季",
        realStats: { BA: 0.292, SLG: 0.380, OBP: 0.366, wOBA: 0.332 },
        rarity: "common",
        cardType: "active",
        description: "守護者內野手，穩健的表現"
    },
    {
        id: "roman_anthony_2025",
        name: "羅曼·安東尼",
        nameEn: "Roman Anthony",
        team: "波士頓紅襪",
        position: "OF",
        era: "2025賽季",
        realStats: { BA: 0.291, SLG: 0.465, OBP: 0.397, wOBA: 0.378 },
        rarity: "epic",
        cardType: "active",
        description: "紅襪頂級新秀，未來之星"
    },
    {
        id: "jake_mangum_2025",
        name: "傑克·曼古姆",
        nameEn: "Jake Mangum",
        team: "紐約大都會",
        position: "OF",
        era: "2025賽季",
        realStats: { BA: 0.291, SLG: 0.364, OBP: 0.324, wOBA: 0.303 },
        rarity: "common",
        cardType: "active",
        description: "大都會外野手，持續努力的球員"
    }
];

// 稀有度配置 - 測試階段：所有稀有度機率相同
const RARITY_CONFIG = {
    common: {
        name: "常見",
        color: "#94A3B8",
        probability: 0.167, // ~16.7% (1/6)
        ovrRange: [40, 69]
    },
    rare: {
        name: "稀有", 
        color: "#3B82F6",
        probability: 0.167, // ~16.7% (1/6)
        ovrRange: [70, 79]
    },
    epic: {
        name: "精英",
        color: "#8B5CF6", 
        probability: 0.167, // ~16.7% (1/6)
        ovrRange: [80, 89]
    },
    legendary: {
        name: "傳說",
        color: "#F59E0B",
        probability: 0.166, // ~16.6% (1/6)
        ovrRange: [90, 99]
    },
    mythic: {
        name: "進化", 
        color: "#EF4444",
        probability: 0.166, // ~16.6% (1/6)
        ovrRange: [100, 109]
    },
    godlike: {
        name: "神獸",
        color: "#FFD700",
        probability: 0.167, // ~16.7% (1/6)
        ovrRange: [110, 150]
    }
};

// 卡片類型配置
const CARD_TYPES = {
    active: "現役球員",
    legend: "歷史傳奇", 
    special: "特殊卡片"
};

// 導出到全域
if (typeof window !== 'undefined') {
    window.PLAYER_DATABASE = PLAYER_DATABASE;
    window.RARITY_CONFIG = RARITY_CONFIG;
    window.CARD_TYPES = CARD_TYPES;
    
    console.log(`✅ 球員資料庫載入完成！包含 ${PLAYER_DATABASE.length} 名球員`);
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PLAYER_DATABASE,
        RARITY_CONFIG,
        CARD_TYPES
    };
}