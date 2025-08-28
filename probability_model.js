// probability-model.js - 概率計算模型（強化極端值版）

// 輔助函數：S-curve 插值
function interpolateSCurve(value, anchors) {
    if (!anchors || !anchors.length) return 0.0;
    if (value <= anchors[0][0]) return anchors[0][1];
    if (value >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
    
    for (let i = 0; i < anchors.length - 1; i++) {
        const [x1, y1] = anchors[i];
        const [x2, y2] = anchors[i + 1];
        if (x1 <= value && value < x2) {
            return (x2 - x1) ? y1 + (y2 - y1) * (value - x1) / (x2 - x1) : y1;
        }
    }
    return anchors[anchors.length - 1][1];
}

// 輔助函數：屬性值轉換為效果因子
function scaleAttributeToEffectiveness(attributeValue, midpoint, scale, effectIsPositive = true) {
    if (scale === 0) return 0.0;
    const normalizedValue = (attributeValue - midpoint) / scale;
    const tanhVal = Math.tanh(normalizedValue);
    return effectIsPositive ? tanhVal : -tanhVal;
}

// 輔助函數：從效果因子計算比率
function getRateFromEffectiveness(baseRateAtMidpoint, minRate, maxRate, effectivenessFactor) {
    return effectivenessFactor >= 0 
        ? baseRateAtMidpoint + effectivenessFactor * (maxRate - baseRateAtMidpoint)
        : baseRateAtMidpoint + effectivenessFactor * (baseRateAtMidpoint - minRate);
}

// 🔥 正常範圍的概率計算（完全保持原版邏輯）
function getPAEventProbabilitiesNormal(POW, HIT, EYE, playerHBPRate = LEAGUE_AVG_HBP_RATE) {
    // 計算 K%, BB%, HBP%
    const eyeKEffect = interpolateSCurve(EYE, K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS);
    const hitKEffect = scaleAttributeToEffectiveness(HIT, K_HIT_EFFECT_MIDPOINT, K_HIT_EFFECT_SCALE, false);
    const combinedKEffect = K_RATE_EYE_WEIGHT * eyeKEffect + K_RATE_HIT_WEIGHT * hitKEffect;
    const pK = Math.max(MIN_K_RATE_CAP, Math.min(MAX_K_RATE_CAP, 
        getRateFromEffectiveness(AVG_K_RATE_AT_MIDPOINT, MIN_K_RATE_CAP, MAX_K_RATE_CAP, combinedKEffect)));
    
    const pBB = Math.max(0.020, Math.min(0.250, interpolateSCurve(EYE, BB_S_CURVE_EYE_ANCHORS)));
    const pHBP = Math.max(0.0, Math.min(0.05, playerHBPRate));
    
    // 計算基礎全壘打率
    let baseHRRate = interpolateSCurve(POW, HR_S_CURVE_POW_ANCHORS);
    
    // 應用 EYE 和 HIT 修正因子（最小化疊加效應以精確匹配分析表）
    const eyeHRModifier = 1.0 + scaleAttributeToEffectiveness(EYE, 70.0, 40.0, true) * 0.02; // 進一步降低: 0.04→0.02
    const hitHRModifier = 1.0 + scaleAttributeToEffectiveness(HIT, 70.0, 40.0, true) * 0.03; // 進一步降低: 0.06→0.03
    let pHR = baseHRRate * eyeHRModifier * hitHRModifier;
    pHR = Math.max(0.0, Math.min(pHR, 0.20));
    
    // 計算剩餘 BIP 事件
    const probSumNonBIPPlusHR = pK + pBB + pHBP + pHR;
    
    let p1B, p2B, pIPO;
    if (probSumNonBIPPlusHR >= 1.0) {
        const scaleDown = 1.0 / probSumNonBIPPlusHR;
        pHR = Math.max(0, 1.0 - (pK * scaleDown + pBB * scaleDown + pHBP * scaleDown));
        p1B = p2B = pIPO = 0.0;
    } else {
        const pBIPForOtherOutcomes = 1.0 - probSumNonBIPPlusHR;
        const pHitGivenBIPRemaining = Math.max(0.190, Math.min(0.450, 
            interpolateSCurve(HIT, BABIP_S_CURVE_HIT_ANCHORS)));
        const pTotalHitsOnRemainingBIP = pBIPForOtherOutcomes * pHitGivenBIPRemaining;
        pIPO = Math.max(0, pBIPForOtherOutcomes * (1.0 - pHitGivenBIPRemaining));
        
        if (pTotalHitsOnRemainingBIP > 0) {
            // 🔥 使用 POW-dependent 2B rate system
            const p2BGivenHitBIPNotHR = interpolateSCurve(POW, DOUBLES_RATE_S_CURVE_POW_ANCHORS);
            const p2BGivenHitBIPNotHRCapped = Math.max(MIN_2B_PER_HIT_BIP_NOT_HR, 
                Math.min(MAX_2B_PER_HIT_BIP_NOT_HR, p2BGivenHitBIPNotHR));
            
            p2B = Math.max(0, pTotalHitsOnRemainingBIP * p2BGivenHitBIPNotHRCapped);
            p1B = Math.max(0, pTotalHitsOnRemainingBIP * (1.0 - p2BGivenHitBIPNotHRCapped));
        } else {
            p1B = p2B = 0.0;
        }
    }
    
    return {HR: pHR, '2B': p2B, '1B': p1B, BB: pBB, HBP: pHBP, K: pK, IPO: pIPO};
}

// 🔥 極端值的概率計算（大幅強化）
function getPAEventProbabilitiesExtreme(POW, HIT, EYE, playerHBPRate = LEAGUE_AVG_HBP_RATE) {
    console.log(`🔥 極端值計算: POW=${POW}, HIT=${HIT}, EYE=${EYE}`);
    
    // 🔥 強化：使用更激進的極端值 S-curves
    let pHR = interpolateSCurve(POW, HR_S_CURVE_POW_ANCHORS_EXTREME);
    let babip = interpolateSCurve(HIT, BABIP_S_CURVE_HIT_ANCHORS_EXTREME);
    let pBB = interpolateSCurve(EYE, BB_S_CURVE_EYE_ANCHORS_EXTREME);
    
    // 🔥 強化：極端值時的額外加成
    if (POW >= 400) {
        pHR = Math.min(0.99, pHR * 1.2); // 400+ POW 時額外 20% 加成
    }
    if (HIT >= 400) {
        babip = Math.min(0.995, babip * 1.1); // 400+ HIT 時額外 10% 加成
    }
    if (EYE >= 400) {
        pBB = Math.min(0.98, pBB * 1.1); // 400+ EYE 時額外 10% 加成
    }
    
    // 三振率計算 - 極端值時大幅改善
    const eyeKEffect = interpolateSCurve(EYE, K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS_EXTREME);
    const hitKEffect = scaleAttributeToEffectiveness(HIT, K_HIT_EFFECT_MIDPOINT, 55.0, false);
    let kRate = getRateFromEffectiveness(
        AVG_K_RATE_AT_MIDPOINT, MIN_K_RATE_CAP, MAX_K_RATE_CAP,
        K_RATE_EYE_WEIGHT * eyeKEffect + K_RATE_HIT_WEIGHT * hitKEffect
    );
    
    // 🔥 強化：極端值時三振率幾乎歸零
    if (HIT >= 300 || EYE >= 300) {
        kRate = Math.max(0.001, kRate * 0.05); // 只有 5% 的原三振率
    }
    if (HIT >= 450 && EYE >= 450) {
        kRate = 0.001; // 幾乎不三振
    }
    
    // HBP 極端值時稍微提高
    let pHBP = LEAGUE_AVG_HBP_RATE;
    if (EYE >= 350) {
        pHBP = Math.min(0.050, LEAGUE_AVG_HBP_RATE * 3);
    }
    
    // 🔥 強化：確保極端值時能達到理論極限
    const basicSum = pHR + pBB + pHBP + kRate;
    
    if (basicSum >= 1.0) {
        // 極端值時優先保證核心表現
        const totalAvailable = 0.999; // 保留一點給其他事件
        
        // 按重要性分配概率
        if (POW >= 450) pHR = Math.min(0.97, pHR); // 97% 全壘打率
        if (EYE >= 450) pBB = Math.min(0.95, pBB);  // 95% 保送率
        
        // 重新分配
        const newSum = pHR + pBB + pHBP + kRate;
        if (newSum > totalAvailable) {
            const scale = totalAvailable / newSum;
            pHR *= scale;
            pBB *= scale;
            kRate *= scale;
        }
        
        const remainingProb = 1.0 - pHR - pBB - pHBP - kRate;
        
        return {
            HR: pHR,
            '2B': remainingProb * 0.8, // 極端值時大部分是長打
            '1B': remainingProb * 0.2,
            BB: pBB,
            HBP: pHBP,
            K: kRate,
            IPO: 0.001
        };
    }
    
    // 計算剩餘 BIP 事件
    const remainingBIP = 1.0 - pHR - pBB - pHBP - kRate;
    const pHitFromBIP = remainingBIP * babip;
    const pIPO = remainingBIP * (1.0 - babip);
    
    // 🔥 強化：極端值時大幅提高長打比例
    let extrabaseRatio = 0.3; // 基準比例
    if (POW >= 300) extrabaseRatio = Math.min(0.85, 0.3 + (POW - 300) / 400);
    if (HIT >= 300) extrabaseRatio = Math.min(0.90, extrabaseRatio + (HIT - 300) / 500);
    if (POW >= 450) extrabaseRatio = 0.95; // 450+ POW 時 95% 是長打
    
    const p2B = pHitFromBIP * extrabaseRatio;
    const p1B = pHitFromBIP * (1 - extrabaseRatio);
    
    const result = {
        HR: pHR,
        '2B': p2B,
        '1B': p1B,
        BB: pBB,
        HBP: pHBP,
        K: kRate,
        IPO: pIPO
    };
    
    console.log(`🔥 強化極端值結果:`, result);
    return result;
}

// 🔥 主要的概率計算函數（智能判斷使用哪種計算方式）
function getPAEventProbabilities(POW, HIT, EYE, playerHBPRate = LEAGUE_AVG_HBP_RATE) {
    // 只有當任一屬性值 >= 200 時才使用極端值計算
    const isExtreme = POW >= EXTREME_VALUE_THRESHOLD || HIT >= EXTREME_VALUE_THRESHOLD || EYE >= EXTREME_VALUE_THRESHOLD;
    
    if (isExtreme) {
        console.log(`🔥 檢測到極端屬性，使用強化極端值計算: POW=${POW}, HIT=${HIT}, EYE=${EYE}`);
        return getPAEventProbabilitiesExtreme(POW, HIT, EYE, playerHBPRate);
    }
    
    // 正常值使用原版精確計算
    return getPAEventProbabilitiesNormal(POW, HIT, EYE, playerHBPRate);
}