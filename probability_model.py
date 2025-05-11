import math
from game_constants import (
    ATTR_EFFECT_MIDPOINT,
    AVG_K_RATE_AT_MIDPOINT, MIN_K_RATE, MAX_K_RATE,
    K_RATE_EYE_WEIGHT, K_RATE_HIT_WEIGHT,
    K_EYE_EFFECT_MIDPOINT, K_EYE_EFFECT_SCALE, K_HIT_EFFECT_MIDPOINT, K_HIT_EFFECT_SCALE,
    AVG_BB_RATE_AT_MIDPOINT, MIN_BB_RATE, MAX_BB_RATE,
    BB_EYE_EFFECT_MIDPOINT, BB_EYE_EFFECT_SCALE,
    
    # New HR Model Parameters
    HR_S_CURVE_POW_ANCHORS, ABSOLUTE_MAX_HR_RATE_CAP,
    HR_EYE_MODIFIER_MIDPOINT, HR_EYE_MODIFIER_SCALE, HR_EYE_MODIFIER_MAX_IMPACT,
    HR_HIT_MODIFIER_MIDPOINT, HR_HIT_MODIFIER_SCALE, HR_HIT_MODIFIER_MAX_IMPACT,

    AVG_BABIP_AT_MIDPOINT, MIN_BABIP_RATE, MAX_BABIP_RATE,
    BABIP_HIT_EFFECT_MIDPOINT, BABIP_HIT_EFFECT_SCALE,
    
    AVG_2B_PER_HIT_BIP_NOT_HR_AT_MIDPOINT, MIN_2B_PER_HIT_BIP_NOT_HR, MAX_2B_PER_HIT_BIP_NOT_HR,
    EXTRABASE_POW_EFFECT_MIDPOINT, EXTRABASE_POW_EFFECT_SCALE,
    EXTRABASE_HIT_EFFECT_MIDPOINT, EXTRABASE_HIT_EFFECT_SCALE,
    EXTRABASE_POW_WEIGHT, EXTRABASE_HIT_WEIGHT,
    LEAGUE_AVG_HBP_RATE
)

def scale_attribute_to_effectiveness(attribute_value, midpoint, scale, effect_is_positive=True):
    """
    Scales an attribute to an effectiveness factor, typically between -1 and 1 (for tanh).
    'effect_is_positive': True if higher attribute means "more of the good thing / less of the bad thing".
    """
    if scale == 0:
        return 0.0
    normalized_value = (attribute_value - midpoint) / scale
    tanh_val = math.tanh(normalized_value)
    return tanh_val if effect_is_positive else -tanh_val

def get_rate_from_effectiveness(base_rate_at_midpoint, min_rate, max_rate, effectiveness_factor):
    """
    Calculates a rate based on an effectiveness factor (-1 to +1).
    """
    if effectiveness_factor >= 0:
        return base_rate_at_midpoint + effectiveness_factor * (max_rate - base_rate_at_midpoint)
    else:
        return base_rate_at_midpoint + effectiveness_factor * (base_rate_at_midpoint - min_rate)

def calculate_k_rate(EYE, HIT):
    """Calculates K rate based on EYE and HIT."""
    eye_eff_k = scale_attribute_to_effectiveness(EYE, K_EYE_EFFECT_MIDPOINT, K_EYE_EFFECT_SCALE, effect_is_positive=False) # Higher EYE = lower K%
    hit_eff_k = scale_attribute_to_effectiveness(HIT, K_HIT_EFFECT_MIDPOINT, K_HIT_EFFECT_SCALE, effect_is_positive=False) # Higher HIT = lower K% (better contact)
    
    # Weighted average of effectiveness factors
    # Note: effect_is_positive=False means tanh_val is already inverted for "bad" outcomes.
    # So, a positive tanh_val (good attribute) becomes negative here, pushing towards MIN_K_RATE.
    # A negative tanh_val (bad attribute) becomes positive, pushing towards MAX_K_RATE.
    # To align with get_rate_from_effectiveness, where positive effectiveness means towards max_rate (good thing)
    # and negative means towards min_rate (bad thing), we need to ensure the interpretation is consistent.
    # For K_Rate, MAX_K_RATE is "bad" and MIN_K_RATE is "good".
    # So, if eye_eff_k is positive (meaning EYE is high, good for reducing K), it should push towards MIN_K_RATE.
    # The current scale_attribute_to_effectiveness with effect_is_positive=False returns:
    #   - positive value if attribute is low (bad for K%) -> pushes towards MAX_K_RATE (correct)
    #   - negative value if attribute is high (good for K%) -> pushes towards MIN_K_RATE (correct)
    combined_eff_k = K_RATE_EYE_WEIGHT * eye_eff_k + K_RATE_HIT_WEIGHT * hit_eff_k
    
    k_rate = get_rate_from_effectiveness(AVG_K_RATE_AT_MIDPOINT, MIN_K_RATE, MAX_K_RATE, combined_eff_k)
    return max(MIN_K_RATE, min(MAX_K_RATE, k_rate))


def calculate_bb_rate(EYE):
    """Calculates BB rate based on EYE."""
    eye_eff_bb = scale_attribute_to_effectiveness(EYE, BB_EYE_EFFECT_MIDPOINT, BB_EYE_EFFECT_SCALE, effect_is_positive=True)
    bb_rate = get_rate_from_effectiveness(AVG_BB_RATE_AT_MIDPOINT, MIN_BB_RATE, MAX_BB_RATE, eye_eff_bb)
    return max(MIN_BB_RATE, min(MAX_BB_RATE, bb_rate))

def interpolate_s_curve(value, anchors):
    """
    Performs linear interpolation for an S-curve defined by anchor points.
    Anchors should be a list of (x, y) tuples, sorted by x.
    """
    if not anchors:
        return 0.0
    
    # Handle cases where value is outside the range of anchors
    if value <= anchors[0][0]:
        return anchors[0][1]
    if value >= anchors[-1][0]:
        return anchors[-1][1]

    # Find the two anchor points to interpolate between
    for i in range(len(anchors) - 1):
        x1, y1 = anchors[i]
        x2, y2 = anchors[i+1]
        if x1 <= value < x2:
            # Linear interpolation formula: y = y1 + (y2 - y1) * (value - x1) / (x2 - x1)
            if (x2 - x1) == 0: # Avoid division by zero, should not happen if anchors are distinct
                return y1 
            return y1 + (y2 - y1) * (value - x1) / (x2 - x1)
    
    return anchors[-1][1] # Should be covered by boundary checks, but as a fallback

def calculate_base_hr_rate_from_pow_s_curve(POW):
    """
    Calculates the base HR rate (per PA) using an S-curve based on POW.
    Uses linear interpolation between anchor points defined in game_constants.
    """
    base_hr_rate = interpolate_s_curve(POW, HR_S_CURVE_POW_ANCHORS)
    return base_hr_rate

def get_pa_event_probabilities(POW, HIT, EYE, player_hbp_rate):
    """
    Calculates the probabilities of different plate appearance outcomes
    using the new sequential model for HR.
    """
    # 1. Calculate K%, BB%, HBP%
    p_k = calculate_k_rate(EYE, HIT)
    p_bb = calculate_bb_rate(EYE)
    
    # Ensure player_hbp_rate is within reasonable bounds, e.g., 0 to 0.05
    p_hbp = max(0.0, min(0.05, player_hbp_rate if player_hbp_rate is not None else LEAGUE_AVG_HBP_RATE))

    # 2. Calculate new P(HR) based on S-curve(POW) and EYE/HIT modifiers
    base_p_hr_pa = calculate_base_hr_rate_from_pow_s_curve(POW)

    # EYE Modifier for HR
    eye_eff_hr_mod = scale_attribute_to_effectiveness(EYE, HR_EYE_MODIFIER_MIDPOINT, HR_EYE_MODIFIER_SCALE, True)
    eye_modifier = 1.0 + (eye_eff_hr_mod * HR_EYE_MODIFIER_MAX_IMPACT) # Centered around 1.0

    # HIT Modifier for HR
    hit_eff_hr_mod = scale_attribute_to_effectiveness(HIT, HR_HIT_MODIFIER_MIDPOINT, HR_HIT_MODIFIER_SCALE, True)
    hit_modifier = 1.0 + (hit_eff_hr_mod * HR_HIT_MODIFIER_MAX_IMPACT) # Centered around 1.0

    p_hr = base_p_hr_pa * eye_modifier * hit_modifier
    p_hr = max(0.0, min(p_hr, ABSOLUTE_MAX_HR_RATE_CAP)) # Apply absolute cap

    # 3. Calculate remaining probability for other BIP outcomes (1B, 2B, IPO)
    prob_sum_non_bip_plus_hr = p_k + p_bb + p_hbp + p_hr
    
    # Safety clamp: if these events already sum to 1 or more, adjust.
    if prob_sum_non_bip_plus_hr >= 1.0:
        # Need to re-normalize K, BB, HBP, HR if they exceed 1.0
        # For simplicity here, we'll cap them and assign 0 to BIP outcomes.
        # A more robust solution would scale them down proportionally.
        scale_down = 1.0 / prob_sum_non_bip_plus_hr if prob_sum_non_bip_plus_hr > 0 else 1.0
        p_k *= scale_down
        p_bb *= scale_down
        p_hbp *= scale_down
        p_hr *= scale_down
        p_hr = max(0, p_hr) # re-ensure after scaling
        
        p_bip_for_other_outcomes = 0.0
        p_1b = 0.0
        p_2b = 0.0
        p_ipo = 0.0
    else:
        p_bip_for_other_outcomes = 1.0 - prob_sum_non_bip_plus_hr

        # 4. Calculate BABIP for the remaining BIP events
        hit_eff_babip = scale_attribute_to_effectiveness(HIT, BABIP_HIT_EFFECT_MIDPOINT, BABIP_HIT_EFFECT_SCALE, True)
        # p_hit_given_bip_remaining is P(Hit | BIP_for_other_outcomes)
        p_hit_given_bip_remaining = get_rate_from_effectiveness(AVG_BABIP_AT_MIDPOINT, MIN_BABIP_RATE, MAX_BABIP_RATE, hit_eff_babip)
        p_hit_given_bip_remaining = max(MIN_BABIP_RATE, min(MAX_BABIP_RATE, p_hit_given_bip_remaining))

        # 5. Calculate P(Total Hits on these BIPs) and P(IPO on these BIPs)
        p_total_hits_on_remaining_bip = p_bip_for_other_outcomes * p_hit_given_bip_remaining
        p_ipo = p_bip_for_other_outcomes * (1.0 - p_hit_given_bip_remaining)
        p_ipo = max(0, p_ipo)

        # 6. Distribute p_total_hits_on_remaining_bip into P(1B) and P(2B)
        # (Triples are not explicitly modeled, implicitly part of 1B or 2B)
        if p_total_hits_on_remaining_bip > 0:
            pow_eff_xbh = scale_attribute_to_effectiveness(POW, EXTRABASE_POW_EFFECT_MIDPOINT, EXTRABASE_POW_EFFECT_SCALE, True)
            hit_eff_xbh = scale_attribute_to_effectiveness(HIT, EXTRABASE_HIT_EFFECT_MIDPOINT, EXTRABASE_HIT_EFFECT_SCALE, True)
            combined_eff_xbh = EXTRABASE_POW_WEIGHT * pow_eff_xbh + EXTRABASE_HIT_WEIGHT * hit_eff_xbh
            
            # p_2b_given_hit_bip_not_hr is P(2B | Hit_on_remaining_BIP)
            p_2b_given_hit_bip_not_hr = get_rate_from_effectiveness(
                AVG_2B_PER_HIT_BIP_NOT_HR_AT_MIDPOINT, 
                MIN_2B_PER_HIT_BIP_NOT_HR, 
                MAX_2B_PER_HIT_BIP_NOT_HR, 
                combined_eff_xbh
            )
            p_2b_given_hit_bip_not_hr = max(MIN_2B_PER_HIT_BIP_NOT_HR, min(MAX_2B_PER_HIT_BIP_NOT_HR, p_2b_given_hit_bip_not_hr))
            
            p_2b = p_total_hits_on_remaining_bip * p_2b_given_hit_bip_not_hr
            p_1b = p_total_hits_on_remaining_bip * (1.0 - p_2b_given_hit_bip_not_hr)
            p_2b = max(0, p_2b)
            p_1b = max(0, p_1b)
        else:
            p_1b = 0.0
            p_2b = 0.0
            
    # Final check for negative probabilities due to floating point arithmetic
    p_hr = max(0.0, p_hr)
    p_2b = max(0.0, p_2b)
    p_1b = max(0.0, p_1b)
    p_bb = max(0.0, p_bb)
    p_hbp = max(0.0, p_hbp)
    p_k = max(0.0, p_k)
    p_ipo = max(0.0, p_ipo)

    # 7. Normalize all probabilities to sum to 1.0
    events = {
        "HR": p_hr, "2B": p_2b, "1B": p_1b,
        "BB": p_bb, "HBP": p_hbp, "K": p_k, "IPO": p_ipo
    }
    
    current_total_prob = sum(events.values())
    
    if current_total_prob == 0: # Should be extremely rare
        # Fallback to a safe state, e.g., 100% IPO if all probabilities somehow became zero.
        return {"HR": 0, "2B": 0, "1B": 0, "BB": 0, "HBP": 0, "K": 0, "IPO": 1.0}

    # Normalize
    norm_factor = 1.0 / current_total_prob
    normalized_events = {key: value * norm_factor for key, value in events.items()}
    
    # Final check of sum after normalization (for debugging)
    # final_sum_check = sum(normalized_events.values())
    # if abs(final_sum_check - 1.0) > 1e-5:
    #     print(f"Warning: Final normalization sum is {final_sum_check}")

    return normalized_events
