// probability-model.js - 概率計算模型（修正版）

// 輔助函數：S-curve 插值
function interpolateSCurve(value, anchors) {
    if (!anchors || !anchors.length) return 0.0;
    const cappedValue = Math.min(value, SOFT_CAP_ATTRIBUTE_VALUE * 1.1);
    if (cappedValue <= anchors[0][0]) return anchors[0][1];
    if (cappedValue >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
    
    for (let i = 0; i < anchors.length - 1; i++) {
        const [x1, y1] = anchors[i];
        const [x2, y2] = anchors[i + 1];
        if (x1 <= cappedValue && cappedValue < x2) {
            return (x2 - x1) ? y1 + (y2 - y1) * (cappedValue - x1) / (x2 - x1) : y1;
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
    
    // 應用 EYE 和 HIT 修正因子
    const eyeHRModifier = 1.0 + scaleAttributeToEffectiveness(EYE, 70.0, 40.0, true) * 0.12;
    const hitHRModifier = 1.0 + scaleAttributeToEffectiveness(HIT, 70.0, 40.0, true) * 0.18;
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
            const powEffXBH = scaleAttributeToEffectiveness(POW, EXTRABASE_POW_EFFECT_MIDPOINT, EXTRABASE_POW_EFFECT_SCALE, true);
            const hitEffXBH = scaleAttributeToEffectiveness(HIT, EXTRABASE_HIT_EFFECT_MIDPOINT, EXTRABASE_HIT_EFFECT_SCALE, true);
            const combinedEffXBH = EXTRABASE_POW_WEIGHT * powEffXBH + EXTRABASE_HIT_WEIGHT * hitEffXBH;
            
            const p2BGivenHitBIPNotHR = getRateFromEffectiveness(
                AVG_2B_PER_HIT_BIP_NOT_HR_AT_MIDPOINT, 
                MIN_2B_PER_HIT_BIP_NOT_HR, 
                MAX_2B_PER_HIT_BIP_NOT_HR, 
                combinedEffXBH
            );
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

// 🔥 極端值的概率計算（僅在屬性值 >= 200 時使用）
function getPAEventProbabilitiesExtreme(POW, HIT, EYE, playerHBPRate = LEAGUE_AVG_HBP_RATE) {
    console.log(`🔥 極端值計算: POW=${POW}, HIT=${HIT}, EYE=${EYE}`);
    
    // 使用極端值 S-curves
    const pHR = interpolateSCurve(POW, HR_S_CURVE_POW_ANCHORS_EXTREME);
    const babip = interpolateSCurve(HIT, BABIP_S_CURVE_HIT_ANCHORS_EXTREME);
    const pBB = interpolateSCurve(EYE, BB_S_CURVE_EYE_ANCHORS_EXTREME);
    
    // 三振率計算
    const eyeKEffect = interpolateSCurve(EYE, K_EYE_EFFECTIVENESS_S_CURVE_ANCHORS_EXTREME);
    const hitKEffect = scaleAttributeToEffectiveness(HIT, K_HIT_EFFECT_MIDPOINT, 55.0, false);
    let kRate = getRateFromEffectiveness(
        AVG_K_RATE_AT_MIDPOINT, MIN_K_RATE_CAP, MAX_K_RATE_CAP,
        K_RATE_EYE_WEIGHT * eyeKEffect + K_RATE_HIT_WEIGHT * hitKEffect
    );
    
    // 極端值時大幅降低三振率
    if (HIT >= 300 || EYE >= 300) {
        kRate = Math.max(0.005, kRate * 0.1);
    }
    
    // HBP 極端值時稍微提高
    let pHBP = LEAGUE_AVG_HBP_RATE;
    if (EYE >= 350) {
        pHBP = Math.min(0.050, LEAGUE_AVG_HBP_RATE * 3);
    }
    
    // 確保概率合理分配
    const basicSum = pHR + pBB + pHBP + kRate;
    if (basicSum >= 1.0) {
        const scale = 0.98 / basicSum;
        const scaledHR = pHR * scale;
        const scaledBB = pBB * scale;
        const scaledK = kRate * scale;
        const remainingProb = 1.0 - scaledHR - scaledBB - pHBP - scaledK;
        
        return {
            HR: scaledHR,
            '2B': remainingProb * 0.4,
            '1B': remainingProb * 0.6,
            BB: scaledBB,
            HBP: pHBP,
            K: scaledK,
            IPO: 0.001
        };
    }
    
    // 計算剩餘 BIP 事件
    const remainingBIP = 1.0 - pHR - pBB - pHBP - kRate;
    const pHitFromBIP = remainingBIP * babip;
    const pIPO = remainingBIP * (1.0 - babip);
    
    // 極端值時提高長打比例
    let extrabaseRatio = 0.3;
    if (POW >= 300) extrabaseRatio = Math.min(0.7, 0.3 + (POW - 300) / 1000);
    if (HIT >= 300) extrabaseRatio = Math.min(0.8, extrabaseRatio + (HIT - 300) / 2000);
    
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
    
    console.log(`極端值結果:`, result);
    return result;
}

// 🔥 主要的概率計算函數（智能判斷使用哪種計算方式）
function getPAEventProbabilities(POW, HIT, EYE, playerHBPRate = LEAGUE_AVG_HBP_RATE) {
    // 只有當任一屬性值 >= 200 時才使用極端值計算
    const isExtreme = POW >= EXTREME_VALUE_THRESHOLD || HIT >= EXTREME_VALUE_THRESHOLD || EYE >= EXTREME_VALUE_THRESHOLD;
    
    if (isExtreme) {
        console.log(`🔥 檢測到極端屬性，使用極端值計算: POW=${POW}, HIT=${HIT}, EYE=${EYE}`);
        return getPAEventProbabilitiesExtreme(POW, HIT, EYE, playerHBPRate);
    }
    
    // 正常值使用原版精確計算
    return getPAEventProbabilitiesNormal(POW, HIT, EYE, playerHBPRate);
}