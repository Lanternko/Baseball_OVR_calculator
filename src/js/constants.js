// constants.js - 新打擊模擬系統統一插值表
// 🎯 設計理念: 8個職責明確的插值表，覆蓋1-500完整屬性範圍

console.log('🔥 載入新常數系統...');

// ====================================
// 💫 EYE 相關表 (2個)
// ====================================

// EYE對保送率的影響 (基於打席數) - 統一標準: BA/OBP/BB%/XBH%/HR占XBH → 對應SLG/HR/2B
const EYE_BB_RATE_TABLE = [
  [1, 0.001],    // 極低EYE: 0.1% BB率
  [20, 0.025],   // 業餘低端: 2.5% BB率
  [40, 0.05],   // pr1: BA.210/OBP.260/BB5%/XBH6.1%/HR13% → SLG.320/HR4/2B27
  [70, 0.087],   // pr50: BA.260/OBP.347/BB8.7%/XBH7.6%/HR42% → SLG.394/HR21/2B29   
  [100, 0.170],  // pr99: BA.320/OBP.490/BB17%/XBH11.1%/HR50% → SLG.533/HR45/2B45 
  [120, 0.20],  // 理論極限: BA.350/OBP.550/BB20%/XBH11.9%/HR55% → SLG.595/HR55/2B45 
  [150, 0.270],  // 人類極限: BA.400/OBP.670/BB27%/XBH13%/HR77% → SLG.740/HR70/2B21 
  [300, 0.450],  // 超人水準: 20% BB率
  [500, 0.800]   // 數學極限: 30% BB率
];

// EYE對揮空減少的影響係數 (0-1，表示揮空率保留比例)
const EYE_EFFECT_TABLE = [
  // [1, 1.0],      // 極低EYE: 揮空率不減少
  // [20, 0.95],    // 業餘低端: 揮空率保留95%
  // [40, 0.85],    // pr1: 揮空率保留85% (減少15%)
  // [70, 0.8],    // pr50: 揮空率保留70% (減少30%)
  // [100, 0.76],   // pr99: 揮空率保留50% (減少50%)
  // [120, 0.7],   // 理論極限: 揮空率保留35%
  // [150, 0.6],   // 人類極限: 揮空率保留20%
  // [300, 0.2],   // 超人水準: 揮空率保留5%
  // [500, 0.1]    // 數學極限: 揮空率保留2%
  [1, 1.0],      // 極低EYE: 揮空率不減少
  [20, 0.95],    // 業餘低端: 揮空率保留95%
  [40, 0.9],    // pr1: 揮空率保留85% (減少15%)
  [70, 0.85],    // pr50: 揮空率保留70% (減少30%)
  [100, 0.8],   // pr99: 揮空率保留50% (減少50%)
  [120, 0.75],   // 理論極限: 揮空率保留35%
  [150, 0.7],   // 人類極限: 揮空率保留20%
  [300, 0.5],   // 超人水準: 揮空率保留5%
  [500, 0.1]    // 數學極限: 揮空率保留2%
];

// ====================================
// 🎯 HIT 相關表 (3個)
// ====================================

// HIT決定總接觸率 (基於揮擊次數) - 統一標準: BA/OBP/BB%/XBH%/HR占XBH → 對應SLG/HR/2B
const HIT_CONTACT_RATE_TABLE = [
  // [1, 0.05],     // 極低HIT: 5% 總接觸率
  // [20, 0.4],    // 業餘低端: 40% 總接觸率
  // [40, 0.53],    // pr1: BA.210/OBP.260/BB5%/XBH6.1%/HR13% → SLG.320/HR4/2B27 
  // [70, 0.59],    // pr50: BA.260/OBP.347/BB8.7%/XBH7.6%/HR42% → SLG.394/HR21/2B29
  // [100, 0.62],   // pr99: BA.320/OBP.490/BB17%/XBH11.1%/HR50% → SLG.533/HR45/2B45
  // [120, 0.65],   // 理論極限: BA.350/OBP.550/BB20%/XBH11.9%/HR55% → SLG.595/HR55/2B45
  // [150, 0.68],   // 人類極限: BA.400/OBP.670/BB27%/XBH13%/HR77% → SLG.740/HR70/2B21
  // [300, 0.85],   // 超人水準: 85% 總接觸率
  // [500, 0.9]    // 數學極限: 90% 總接觸率
    [1, 0.05],     // 極低HIT: 5% 總接觸率
  [20, 0.4],    // 業餘低端: 40% 總接觸率
  [40, 0.53],    // pr1: BA.210/OBP.260/BB5%/XBH6.1%/HR13% → SLG.320/HR4/2B27 
  [70, 0.59],    // pr50: BA.260/OBP.347/BB8.7%/XBH7.6%/HR42% → SLG.394/HR21/2B29
  [100, 0.62],   // pr99: BA.320/OBP.490/BB17%/XBH11.1%/HR50% → SLG.533/HR45/2B45
  [120, 0.65],   // 理論極限: BA.350/OBP.550/BB20%/XBH11.9%/HR55% → SLG.595/HR55/2B45
  [150, 0.66],   // 人類極限: BA.400/OBP.670/BB27%/XBH13%/HR77% → SLG.740/HR70/2B21
  [300, 0.85],   // 超人水準: 85% 總接觸率
  [500, 0.9]    // 數學極限: 90% 總接觸率
];

// HIT決定品質接觸在總接觸中的比例 (0-1) - Level 70回調平衡
const HIT_QUALITY_RATIO_TABLE = [
  // [1, 0.01],     // 極低HIT: 接觸中10%是品質
  // [20, 0.04],    // 業餘低端: 接觸中22%是品質
  // [40, 0.08],    // pr1: 接觸中35%是品質 (助Level 40)
  // [70, 0.093],    // pr50: 接觸中37%是品質 (回調保持Level 70平衡)
  // [100, 0.1],   // pr99: 接觸中58%是品質 
  // [120, 0.106],   // 理論極限: 接觸中66%是品質 
  // [150, 0.111],   // 人類極限: 接觸中73%是品質 
  // [300, 0.86],   // 超人水準: 接觸中86%是品質
  // [500, 0.95]    // 數學極限: 接觸中95%是品質
  [1, 0.01],     // 極低HIT: 接觸中10%是品質
  [20, 0.04],    // 業餘低端: 接觸中22%是品質
  [40, 0.08],    // pr1: 接觸中35%是品質 (助Level 40)
  [70, 0.08],    // pr50: 接觸中37%是品質 (回調保持Level 70平衡)
  [100, 0.09],   // pr99: 接觸中58%是品質 
  [120, 0.10],   // 理論極限: 接觸中66%是品質 
  [150, 0.11],   // 人類極限: 接觸中73%是品質 
  [300, 0.86],   // 超人水準: 接觸中86%是品質
  [500, 0.95]    // 數學極限: 接觸中95%是品質
];

// HIT對各種負面效果的減少係數 (0-1，表示負面效果保留比例)
// 🔥 統一公式: 簡單乘法減少負面效果
const HIT_EFFECT_TABLE = [
  // [1, 1.0],      // 極低HIT: 負面效果完全保留
  // [20, 0.95],    // 業餘低端: 負面效果保留95%
  // [40, 0.90],    // pr1: 負面效果保留85% (改善15%)
  // [70, 0.86],    // pr50: 負面效果保留70% (改善30%)
  // [100, 0.82],   // pr99: 負面效果保留50% (改善50%)
  // [120, 0.79],   // 理論極限: 負面效果保留35%
  // [150, 0.76],   // 人類極限: 負面效果保留20%
  // [300, 0.15],   // 超人水準: 負面效果保留5%
  // [500, 0.05]    // 數學極限: 負面效果保留2%
    [1, 1.0],      // 極低HIT: 負面效果完全保留
  [20, 0.95],    // 業餘低端: 負面效果保留95%
  [40, 0.90],    // pr1: 負面效果保留85% (改善15%)
  [70, 0.87],    // pr50: 負面效果保留70% (改善30%)
  [100, 0.82],   // pr99: 負面效果保留50% (改善50%)
  [120, 0.8],   // 理論極限: 負面效果保留35%
  [150, 0.77],   // 人類極限: 負面效果保留20%
  [300, 0.15],   // 超人水準: 負面效果保留5%
  [500, 0.05]    // 數學極限: 負面效果保留2%
];

// ====================================
// 💥 POW 相關表 (3個)
// ====================================

// POW決定高飛球率 (基於接觸次數) - 恢復正常遞增支持HR產出
const POW_FLYBALL_RATE_TABLE = [
  [1, 0.20],     // 極低POW: 20% 高飛球率
  [20, 0.28],    // 業餘低端: 28% 高飛球率
  [40, 0.32],    // pr1: 32% 高飛球率
  [70, 0.38],    // pr50: 38% 高飛球率
  [100, 0.42],   // pr99: 42% 高飛球率 (恢復遞增)
  [120, 0.45],   // 理論極限: 45% 高飛球率 (恢復遞增)
  [150, 0.48],   // 人類極限: 48% 高飛球率 (恢復遞增)
  [300, 0.60],   // 超人水準: 55% 高飛球率
  [500, 0.99]    // 數學極限: 65% 高飛球率
];

// POW決定總XBH率 (基於接觸次數) - 統一標準: BA/OBP/BB%/XBH%/HR占XBH → 對應SLG/HR/2B
const POW_XBH_RATE_TABLE = [
  // [1, 0.01],    // 極低POW: 1% XBH率
  // [20, 0.05],   // 業餘低端: 5% XBH率  
  // [40, 0.246],   // pr1: BA.225/OBP.264/BB5.1%/XBH7.0%/HR10% → SLG.313/HR4/2B38
  // [70, 0.32],   // pr50: BA.284/OBP.347/BB8.8%/XBH9.8%/HR34% → SLG.464/HR20/2B39
  // [100, 0.443],  // pr99: BA.343/OBP.455/BB17.0%/XBH13.0%/HR40% → SLG.625/HR31/2B47
  // [120, 0.476],  // 理論極限: BA.381/OBP.504/BB19.8%/XBH14.2%/HR44% → SLG.713/HR37/2B48
  // [150, 0.52],  // 人類極限: BA.431/OBP.584/BB26.9%/XBH14.7%/HR63% → SLG.884/HR55/2B33
  // [300, 0.6],  // 超人水準: 60% XBH率
  // [500, 0.99]   // 數學極限: 99% XBH率
  [1, 0.01],    // 極低POW: 1% XBH率
  [20, 0.05],   // 業餘低端: 5% XBH率  
  [40, 0.246],   // pr1: BA.225/OBP.264/BB5.1%/XBH7.0%/HR10% → SLG.313/HR4/2B38
  [70, 0.32],   // pr50: BA.284/OBP.347/BB8.8%/XBH9.8%/HR34% → SLG.464/HR20/2B39
  [100, 0.443],  // pr99: BA.343/OBP.455/BB17.0%/XBH13.0%/HR40% → SLG.625/HR31/2B47
  [120, 0.55],  // 理論極限: BA.381/OBP.504/BB19.8%/XBH14.2%/HR44% → SLG.713/HR37/2B48
  [150, 0.67],  // 人類極限: BA.431/OBP.584/BB26.9%/XBH14.7%/HR63% → SLG.884/HR55/2B33
  [300, 0.7],  // 超人水準: 60% XBH率
  [500, 0.99]   // 數學極限: 99% XBH率

];

// POW決定HR在XBH中的占比 (0-1) - 統一標準: BA/OBP/BB%/XBH%/HR占XBH → 對應SLG/HR/2B
const POW_HR_XBH_RATIO_TABLE = [
  [1, 0.01],     // 極低POW: XBH中1%是HR
  [20, 0.05],    // 業餘低端: XBH中5%是HR
  [40, 0.129],    // pr1: BA.225/OBP.264/BB5.1%/XBH7.0%/HR10% → SLG.313/HR4/2B38
  [70, 0.42],    // pr50: BA.284/OBP.347/BB8.8%/XBH9.8%/HR34% → SLG.464/HR20/2B39
  [100, 0.5],   // pr99: BA.343/OBP.455/BB17.0%/XBH13.0%/HR40% → SLG.625/HR31/2B47
  [120, 0.55],   // 理論極限: BA.381/OBP.504/BB19.8%/XBH14.2%/HR44% → SLG.713/HR37/2B48
  [150, 0.77],   // 人類極限: BA.431/OBP.584/BB26.9%/XBH14.7%/HR63% → SLG.884/HR55/2B33
  [300, 0.75],   // 超人水準: XBH中75%是HR
  [500, 0.99]    // 數學極限: XBH中99%是HR
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
// 修正公式: 簡單乘法減少負面效果
function applyHITEffect(baseNegativeRate, HIT) {
  const hitEffect = interpolate(HIT, HIT_EFFECT_TABLE);
  const adjustedRate = baseNegativeRate * hitEffect; // 直接乘法降低
  return Math.max(0.0001, adjustedRate); // 最低限制至0.01%
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