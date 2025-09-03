// reverse_engineer.js - Stats → Attributes 逆向工程計算器
// 使用迭代收斂算法從統計數據反推屬性值

console.log('🔄 載入逆向工程計算器...');

// 逆向工程主函數
function reverseEngineerAttributes(targetStats, tolerance = 0.001, maxIterations = 50) {
    const target = {
        BA: targetStats.BA || 0.310,
        OBP: targetStats.OBP || 0.390, 
        SLG: targetStats.SLG || 0.646,
        PA: targetStats.PA || 600
    };
    
    console.log(`🎯 目標統計: BA=${target.BA.toFixed(3)}, OBP=${target.OBP.toFixed(3)}, SLG=${target.SLG.toFixed(3)}`);
    
    // 初始猜測：基於BA粗略估計HIT
    let currentAttrs = {
        HIT: estimateInitialHIT(target.BA),
        POW: 70, // 從中等水平開始
        EYE: 70  // 從中等水平開始
    };
    
    let iteration = 0;
    const adjustmentFactor = 10; // 初始調整幅度
    let lastError = Infinity;
    
    console.log(`🚀 開始迭代收斂...初始猜測: HIT=${currentAttrs.HIT}, POW=${currentAttrs.POW}, EYE=${currentAttrs.EYE}`);
    
    while (iteration < maxIterations) {
        iteration++;
        
        // 模擬當前屬性的統計
        const simulated = simulatePlayerStats(currentAttrs.POW, currentAttrs.HIT, currentAttrs.EYE, 10, target.PA);
        
        // 計算誤差
        const errors = {
            BA: target.BA - simulated.BA,
            OBP: target.OBP - simulated.OBP,
            SLG: target.SLG - simulated.SLG
        };
        
        const totalError = Math.abs(errors.BA) + Math.abs(errors.OBP) + Math.abs(errors.SLG);
        
        console.log(`迭代 ${iteration}: HIT=${currentAttrs.HIT.toFixed(1)}, POW=${currentAttrs.POW.toFixed(1)}, EYE=${currentAttrs.EYE.toFixed(1)}`);
        console.log(`  實際: BA=${simulated.BA.toFixed(3)}, OBP=${simulated.OBP.toFixed(3)}, SLG=${simulated.SLG.toFixed(3)}`);
        console.log(`  誤差: BA=${errors.BA.toFixed(4)}, OBP=${errors.OBP.toFixed(4)}, SLG=${errors.SLG.toFixed(4)}, 總誤差=${totalError.toFixed(4)}`);
        
        // 檢查收斂
        if (totalError < tolerance) {
            console.log(`✅ 收斂成功！總誤差 ${totalError.toFixed(6)} < 容忍度 ${tolerance}`);
            break;
        }
        
        // 動態調整因子（隨迭代減小）
        const currentAdjustment = adjustmentFactor * Math.max(0.1, 1 - iteration / maxIterations);
        
        // 分步調整：優先順序 BA → OBP → SLG
        const adjustments = calculateAdjustments(errors, currentAdjustment);
        
        // 應用調整
        currentAttrs.HIT = Math.max(1, Math.min(500, currentAttrs.HIT + adjustments.HIT));
        currentAttrs.EYE = Math.max(1, Math.min(500, currentAttrs.EYE + adjustments.EYE));
        currentAttrs.POW = Math.max(1, Math.min(500, currentAttrs.POW + adjustments.POW));
        
        // 防震盪：如果誤差增大太多，減小調整幅度
        if (totalError > lastError * 1.5) {
            console.log(`⚠️ 誤差震盪，減小調整幅度`);
            currentAttrs.HIT -= adjustments.HIT * 0.5;
            currentAttrs.EYE -= adjustments.EYE * 0.5; 
            currentAttrs.POW -= adjustments.POW * 0.5;
        }
        
        lastError = totalError;
    }
    
    // 最終驗證
    const finalSim = simulatePlayerStats(currentAttrs.POW, currentAttrs.HIT, currentAttrs.EYE, 20, target.PA);
    const ovrResult = calculateBatterOVR(currentAttrs.POW, currentAttrs.HIT, currentAttrs.EYE);
    const finalOVR = ovrResult.ovr;
    
    console.log(`\n🏆 逆向工程結果:`);
    console.log(`屬性: HIT=${Math.round(currentAttrs.HIT)}, POW=${Math.round(currentAttrs.POW)}, EYE=${Math.round(currentAttrs.EYE)}, OVR=${finalOVR}`);
    console.log(`驗證: BA=${finalSim.BA.toFixed(3)}, OBP=${finalSim.OBP.toFixed(3)}, SLG=${finalSim.SLG.toFixed(3)}`);
    
    return {
        attributes: {
            HIT: Math.round(currentAttrs.HIT),
            POW: Math.round(currentAttrs.POW), 
            EYE: Math.round(currentAttrs.EYE),
            OVR: finalOVR
        },
        finalStats: finalSim,
        iterations: iteration,
        converged: iteration < maxIterations
    };
}

// 基於BA估計初始HIT值
function estimateInitialHIT(targetBA) {
    // 基於我們的實測數據建立粗略映射
    if (targetBA <= 0.225) return 40;
    if (targetBA <= 0.284) return 70;
    if (targetBA <= 0.343) return 100;
    if (targetBA <= 0.381) return 120;
    return 150;
}

// 計算屬性調整量
function calculateAdjustments(errors, adjustmentFactor) {
    // 基於統計知識設定屬性影響權重
    const adjustments = {
        HIT: 0,
        POW: 0,
        EYE: 0
    };
    
    // 🎯 調整係數優化 - 減少過度調整
    // 1. BA主要由HIT控制
    if (Math.abs(errors.BA) > 0.001) {
        adjustments.HIT = errors.BA * adjustmentFactor * 50; // 降低: 100→50
    }
    
    // 2. OBP誤差主要由EYE控制（BB率）
    const obpDiff = errors.OBP - errors.BA; // 去除BA影響的純OBP差異
    if (Math.abs(obpDiff) > 0.001) {
        adjustments.EYE = obpDiff * adjustmentFactor * 60; // 降低: 150→60
    }
    
    // 3. SLG主要由POW控制（長打能力）
    if (Math.abs(errors.SLG) > 0.001) {
        adjustments.POW = errors.SLG * adjustmentFactor * 40; // 降低: 80→40
    }
    
    return adjustments;
}

// 簡化的屬性預測（快速估計）
function quickEstimateAttributes(targetStats) {
    const ba = targetStats.BA || 0.310;
    const obp = targetStats.OBP || 0.390;
    const slg = targetStats.SLG || 0.646;
    
    // 基於實測數據的線性插值估計
    const hit = interpolateAttribute(ba, [
        [0.225, 40], [0.284, 70], [0.343, 100], [0.381, 120], [0.431, 150]
    ]);
    
    const eye = interpolateAttribute(obp, [
        [0.264, 40], [0.347, 70], [0.455, 100], [0.504, 120], [0.584, 150]
    ]);
    
    const pow = interpolateAttribute(slg, [
        [0.313, 40], [0.464, 70], [0.580, 100], [0.650, 136], [0.800, 150]
    ]);
    
    const ovrResult = calculateBatterOVR(pow, hit, eye);
    return {
        HIT: Math.round(hit),
        POW: Math.round(pow),
        EYE: Math.round(eye),
        OVR: ovrResult.ovr
    };
}

// 線性插值輔助函數
function interpolateAttribute(value, anchors) {
    if (value <= anchors[0][0]) return anchors[0][1];
    if (value >= anchors[anchors.length-1][0]) return anchors[anchors.length-1][1];
    
    for (let i = 0; i < anchors.length - 1; i++) {
        const [x1, y1] = anchors[i];
        const [x2, y2] = anchors[i + 1];
        
        if (value >= x1 && value <= x2) {
            return y1 + (y2 - y1) * (value - x1) / (x2 - x1);
        }
    }
    
    return anchors[0][1];
}

console.log('✅ 逆向工程計算器載入完成！');

// 模塊導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        reverseEngineerAttributes,
        quickEstimateAttributes,
        estimateInitialHIT,
        calculateAdjustments
    };
}

// 瀏覽器環境
if (typeof window !== 'undefined') {
    window.REVERSE_ENGINEER = {
        reverseEngineerAttributes,
        quickEstimateAttributes,
        estimateInitialHIT,
        calculateAdjustments
    };
    
    // 全域函數導出 (供 calculatePlayerGameAttributes 使用)
    window.quickEstimateAttributes = quickEstimateAttributes;
    window.reverseEngineerAttributes = reverseEngineerAttributes;
}