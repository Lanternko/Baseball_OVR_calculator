// new_constants.js - 新打擊模擬系統統一插值表
// 🎯 設計理念: 8個職責明確的插值表，覆蓋1-500完整屬性範圍

console.log('🔥 載入新常數系統...');

// ====================================
// 💫 EYE 相關表 (2個)
// ====================================

// EYE對保送率的影響 (基於打席數)
const EYE_BB_RATE_TABLE = [
  [1, 0.001],    // 極低EYE: 0.1% BB率
  [20, 0.025],   // 業餘低端: 2.5% BB率
  [40, 0.070],   // pr1: 7% BB率 → 配合BA 0.210達成OBP 0.280
  [70, 0.100],   // pr50: 10% BB率 → 配合BA 0.260達成OBP 0.330  
  [100, 0.140],  // pr99: 14% BB率 → 配合BA 0.320達成OBP 0.420
  [120, 0.180],  // 理論極限: 18% BB率
  [150, 0.250],  // 人類極限: 25% BB率
  [300, 0.450],  // 超人水準: 45% BB率
  [500, 0.700]   // 數學極限: 70% BB率
];

// EYE對揮空減少的影響係數 (0-1，表示揮空率保留比例)
const EYE_EFFECT_TABLE = [
  [1, 1.0],      // 極低EYE: 揮空率不減少
  [20, 0.95],    // 業餘低端: 揮空率保留95%
  [40, 0.85],    // pr1: 揮空率保留85% (減少15%)
  [70, 0.70],    // pr50: 揮空率保留70% (減少30%)
  [100, 0.50],   // pr99: 揮空率保留50% (減少50%)
  [120, 0.35],   // 理論極限: 揮空率保留35%
  [150, 0.20],   // 人類極限: 揮空率保留20%
  [300, 0.05],   // 超人水準: 揮空率保留5%
  [500, 0.02]    // 數學極限: 揮空率保留2%
];

// ====================================
// 🎯 HIT 相關表 (3個)
// ====================================

// HIT決定總接觸率 (基於揮擊次數) - 多目標優化校準
const HIT_CONTACT_RATE_TABLE = [
  [1, 0.15],     // 極低HIT: 15% 總接觸率
  [20, 0.42],    // 業餘低端: 42% 總接觸率
  [40, 0.58],    // pr1: 58% 總接觸率 → 目標BA 0.210 (✅保持)
  [70, 0.66],    // pr50: 66% 總接觸率 → 目標BA 0.260 (恢復)
  [100, 0.81],   // pr99: 81% 總接觸率 → 目標BA 0.320 (提升)
  [120, 0.86],   // 理論極限: 86% 總接觸率 → 目標BA 0.350 (提升)
  [150, 0.92],   // 人類極限: 92% 總接觸率 → 目標BA 0.400 (✅保持)
  [300, 0.99],   // 超人水準: 99% 總接觸率
  [500, 0.999]   // 數學極限: 99.9% 總接觸率
];

// HIT決定品質接觸在總接觸中的比例 (0-1)
const HIT_QUALITY_RATIO_TABLE = [
  [1, 0.10],     // 極低HIT: 接觸中10%是品質
  [20, 0.20],    // 業餘低端: 接觸中20%是品質
  [40, 0.25],    // pr1: 接觸中25%是品質
  [70, 0.35],    // pr50: 接觸中35%是品質
  [100, 0.50],   // pr99: 接觸中50%是品質
  [120, 0.65],   // 理論極限: 接觸中65%是品質
  [150, 0.80],   // 人類極限: 接觸中80%是品質
  [300, 0.95],   // 超人水準: 接觸中95%是品質
  [500, 0.99]    // 數學極限: 接觸中99%是品質
];

// HIT對各種負面效果的減少係數 (0-1，表示負面效果保留比例)
// 🔥 統一公式: 1-(1-baseRate)*hitEffect
const HIT_EFFECT_TABLE = [
  [1, 1.0],      // 極低HIT: 負面效果完全保留
  [20, 0.95],    // 業餘低端: 負面效果保留95%
  [40, 0.85],    // pr1: 負面效果保留85% (改善15%)
  [70, 0.70],    // pr50: 負面效果保留70% (改善30%)
  [100, 0.50],   // pr99: 負面效果保留50% (改善50%)
  [120, 0.35],   // 理論極限: 負面效果保留35%
  [150, 0.20],   // 人類極限: 負面效果保留20%
  [300, 0.05],   // 超人水準: 負面效果保留5%
  [500, 0.02]    // 數學極限: 負面效果保留2%
];

// ====================================
// 💥 POW 相關表 (3個)
// ====================================

// POW決定高飛球率 (基於接觸次數)
const POW_FLYBALL_RATE_TABLE = [
  [1, 0.20],     // 極低POW: 20% 高飛球率
  [20, 0.28],    // 業餘低端: 28% 高飛球率
  [40, 0.32],    // pr1: 32% 高飛球率
  [70, 0.38],    // pr50: 38% 高飛球率 (MLB平均)
  [100, 0.45],   // pr99: 45% 高飛球率
  [120, 0.52],   // 理論極限: 52% 高飛球率
  [150, 0.62],   // 人類極限: 62% 高飛球率
  [300, 0.80],   // 超人水準: 80% 高飛球率
  [500, 0.95]    // 數學極限: 95% 高飛球率
];

// POW決定總XBH率 (基於接觸次數) - 最終校準  
const POW_XBH_RATE_TABLE = [
  [1, 0.04],     // 極低POW: 4% XBH率
  [20, 0.06],    // 業餘低端: 6% XBH率  
  [40, 0.10],    // pr1: 10% XBH率 → 31 XBH (4 HR + 27 2B)
  [70, 0.115],   // pr50: 11.5% XBH率 → 50 XBH (21 HR + 29 2B) (保持)
  [100, 0.21],   // pr99: 21% XBH率 → 85 XBH (45 HR + 40 2B) (完美保持)
  [120, 0.26],   // 理論極限: 26% XBH率 → 100 XBH (55 HR + 45 2B)
  [150, 0.32],   // 人類極限: 32% XBH率 → 125 XBH (70 HR + 55 2B)  
  [300, 0.50],   // 超人水準: 50% XBH率
  [500, 0.70]    // 數學極限: 70% XBH率
];

// POW決定HR在XBH中的占比 (0-1) - 多級優化平衡
const POW_HR_XBH_RATIO_TABLE = [
  [1, 0.08],     // 極低POW: XBH中8%是HR
  [20, 0.10],    // 業餘低端: XBH中10%是HR
  [40, 0.13],    // pr1: XBH中13%是HR → 精確HR=4 (✅保持)
  [70, 0.42],    // pr50: XBH中42%是HR → 精確HR=21 (恢復)
  [100, 0.53],   // pr99: XBH中53%是HR → 精確HR=45 (提升)
  [120, 0.55],   // 理論極限: XBH中55%是HR → 精確HR=55 (提升)
  [150, 0.56],   // 人類極限: XBH中56%是HR → 精確HR=70 (✅保持)
  [300, 0.65],   // 超人水準: XBH中65%是HR
  [500, 0.75]    // 數學極限: XBH中75%是HR
];

// ====================================
// 🛠️ 通用工具函數
// ====================================

// 統一插值函數 - 支援1-500完整範圍
function interpolate(value, anchors) {
  // 安全範圍限制
  value = Math.max(1, Math.min(500, value));
  
  // 查找插值區間
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x1, y1] = anchors[i];
    const [x2, y2] = anchors[i + 1];
    
    if (value >= x1 && value <= x2) {
      if (x2 === x1) return y1; // 防除零
      return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
    }
  }
  
  // 邊界情況
  return value <= anchors[0][0] ? anchors[0][1] : anchors[anchors.length - 1][1];
}

// 統一HIT效果應用函數 - 用於所有負面效果減少
// 公式: 1-(1-baseNegativeRate)*hitEffect
function applyHITEffect(baseNegativeRate, HIT) {
  const hitEffect = interpolate(HIT, HIT_EFFECT_TABLE);
  const adjustedRate = 1 - (1 - baseNegativeRate) * hitEffect;
  return Math.max(0.001, adjustedRate); // 最低保留0.1%
}

// ====================================
// 🧪 表格驗證函數
// ====================================

// 驗證所有插值表的單調性和邊界值
function validateTables() {
  const tables = [
    {name: 'EYE_BB_RATE', table: EYE_BB_RATE_TABLE},
    {name: 'EYE_EFFECT', table: EYE_EFFECT_TABLE},
    {name: 'HIT_CONTACT_RATE', table: HIT_CONTACT_RATE_TABLE},
    {name: 'HIT_QUALITY_RATIO', table: HIT_QUALITY_RATIO_TABLE},
    {name: 'HIT_EFFECT', table: HIT_EFFECT_TABLE},
    {name: 'POW_FLYBALL_RATE', table: POW_FLYBALL_RATE_TABLE},
    {name: 'POW_XBH_RATE', table: POW_XBH_RATE_TABLE},
    {name: 'POW_HR_XBH_RATIO', table: POW_HR_XBH_RATIO_TABLE}
  ];
  
  console.log('🧪 驗證插值表...');
  
  tables.forEach(({name, table}) => {
    // 檢查單調性
    for (let i = 0; i < table.length - 1; i++) {
      const [x1, y1] = table[i];
      const [x2, y2] = table[i + 1];
      
      if (x2 <= x1) {
        console.error(`❌ ${name}: X值非遞增 ${x1} → ${x2}`);
      }
      
      // 大部分表應該遞增（EYE_EFFECT和HIT_EFFECT遞減是正常的）
      if (!name.includes('EFFECT') && y2 < y1) {
        console.warn(`⚠️ ${name}: Y值遞減 ${y1} → ${y2}`);
      }
    }
    
    // 檢查關鍵點
    const val40 = interpolate(40, table);
    const val70 = interpolate(70, table);  
    const val100 = interpolate(100, table);
    
    console.log(`✅ ${name}: Level 40=${val40.toFixed(3)}, 70=${val70.toFixed(3)}, 100=${val100.toFixed(3)}`);
  });
}

// ====================================
// 🚀 模塊導出和初始化
// ====================================

// 執行驗證
validateTables();

console.log('✅ 新常數系統載入完成！');

// 全域變數導出（保持向下相容）
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 環境
  module.exports = {
    EYE_BB_RATE_TABLE,
    EYE_EFFECT_TABLE,
    HIT_CONTACT_RATE_TABLE,
    HIT_QUALITY_RATIO_TABLE,
    HIT_EFFECT_TABLE,
    POW_FLYBALL_RATE_TABLE,
    POW_XBH_RATE_TABLE,
    POW_HR_XBH_RATIO_TABLE,
    interpolate,
    applyHITEffect,
    validateTables
  };
}

// 瀏覽器環境 - 全域變數
if (typeof window !== 'undefined') {
  // 設定全域變數 (直接在window上)
  window.EYE_BB_RATE_TABLE = EYE_BB_RATE_TABLE;
  window.EYE_EFFECT_TABLE = EYE_EFFECT_TABLE;
  window.HIT_CONTACT_RATE_TABLE = HIT_CONTACT_RATE_TABLE;
  window.HIT_QUALITY_RATIO_TABLE = HIT_QUALITY_RATIO_TABLE;
  window.HIT_EFFECT_TABLE = HIT_EFFECT_TABLE;
  window.POW_FLYBALL_RATE_TABLE = POW_FLYBALL_RATE_TABLE;
  window.POW_XBH_RATE_TABLE = POW_XBH_RATE_TABLE;
  window.POW_HR_XBH_RATIO_TABLE = POW_HR_XBH_RATIO_TABLE;
  window.interpolate = interpolate;
  window.applyHITEffect = applyHITEffect;
  window.validateTables = validateTables;
  
  // 也保留物件形式
  window.NEW_CONSTANTS = {
    EYE_BB_RATE_TABLE,
    EYE_EFFECT_TABLE,
    HIT_CONTACT_RATE_TABLE,
    HIT_QUALITY_RATIO_TABLE,
    HIT_EFFECT_TABLE,
    POW_FLYBALL_RATE_TABLE,
    POW_XBH_RATE_TABLE,
    POW_HR_XBH_RATIO_TABLE,
    interpolate,
    applyHITEffect,
    validateTables
  };
}