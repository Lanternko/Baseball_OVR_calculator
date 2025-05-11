# optimization_utils.py
import math
import random

def calculate_error_with_anchor(sim_stats,
                                target_stats_ratios,
                                target_stats_counts,
                                current_abilities,
                                anchor_abilities,
                                error_weights,
                                weight_deviation_penalty):
    error_sim = 0.0
    # Ratio stats
    for stat_key in ["BA", "OBP", "SLG"]:
        if target_stats_ratios.get(stat_key, 0) > 0: # Ensure target is not zero to avoid division by zero
            sim_val = sim_stats.get(stat_key, 0)
            target_val = target_stats_ratios[stat_key]
            error_sim += error_weights.get(stat_key, 1.0) * \
                ((sim_val - target_val) / target_val)**2

    # Count stats (like HR, BB, K)
    # HR
    sim_hr = sim_stats.get("HR_count", 0)
    target_hr = target_stats_counts.get("HR_target", 0)
    if target_hr > 0:
        error_sim += error_weights.get("HR", 1.0) * \
            ((sim_hr - target_hr) / target_hr)**2
    
    # BB
    sim_bb = sim_stats.get("BB_count", 0)
    target_bb = target_stats_counts.get("BB_target", 0)
    if target_bb > 0:
        error_sim += error_weights.get("BB", 1.0) * \
            ((sim_bb - target_bb) / target_bb)**2

    # K (Strikeouts) - New
    sim_k = sim_stats.get("K_count", 0)
    target_k = target_stats_counts.get("K_target", 0) # Assumes K_target is in target_stats_counts
    if target_k is not None and target_k > 0: # Check if K_target is provided
        error_sim += error_weights.get("K", 1.0) * \
            ((sim_k - target_k) / target_k)**2
    elif target_stats_ratios.get("K_rate", 0) > 0: # Fallback to K_rate if K_count target not available
        sim_k_rate = sim_stats.get("K_rate",0)
        target_k_rate = target_stats_ratios["K_rate"]
        error_sim += error_weights.get("K", 1.0) * \
            ((sim_k_rate - target_k_rate) / target_k_rate)**2


    # Anchor deviation penalty (no change here)
    error_anchor_dev = 0.0
    norm_pow = anchor_abilities.get("POW", 70) if anchor_abilities.get("POW", 70) != 0 else 70
    norm_hit = anchor_abilities.get("HIT", 70) if anchor_abilities.get("HIT", 70) != 0 else 70
    norm_eye = anchor_abilities.get("EYE", 70) if anchor_abilities.get("EYE", 70) != 0 else 70

    error_anchor_dev += ((current_abilities["POW"] - anchor_abilities["POW"]) / norm_pow )**2
    error_anchor_dev += ((current_abilities["HIT"] - anchor_abilities["HIT"]) / norm_hit )**2
    error_anchor_dev += ((current_abilities["EYE"] - anchor_abilities["EYE"]) / norm_eye )**2
    
    total_error = math.sqrt(error_sim + weight_deviation_penalty * error_anchor_dev)
    return total_error


def find_best_attributes_random_search(
        player_name,
        anchor_abilities,
        target_pa,
        target_counts, # Should include HR_target, BB_target, K_target (if available)
        target_ratios, # Should include BA, OBP, SLG, K_rate (if K_target not available)
        player_hbp_rate,
        error_weights,
        deviation_penalty_weight,
        prob_calculator_func,
        season_simulator_func,
        stats_calculator_func,
        pow_search_range,
        hit_search_range,
        eye_search_range,
        num_iterations,
        num_seasons_per_eval
    ):
    best_pow = anchor_abilities['POW']
    best_hit = anchor_abilities['HIT']
    best_eye = anchor_abilities['EYE']
    min_total_error = float('inf')
    
    print(f"\n開始為 {player_name} 自動迭代搜索最佳 POW, HIT, EYE (共 {num_iterations} 次嘗試, 含錨點懲罰)...")
    print(f"每次嘗試將模擬 {num_seasons_per_eval} 個賽季，每個賽季 {target_pa} 個打席。")

    for i in range(num_iterations):
        current_pow = random.uniform(pow_search_range[0], pow_search_range[1])
        current_hit = random.uniform(hit_search_range[0], hit_search_range[1])
        current_eye = random.uniform(eye_search_range[0], eye_search_range[1])
        current_trial_abilities = {"POW": current_pow, "HIT": current_hit, "EYE": current_eye}

        current_event_probs = prob_calculator_func(
            current_pow, current_hit, current_eye, player_hbp_rate
        )
        
        # Aggregate stats over num_seasons_per_eval
        # Store all individual season sim_stats dicts to average them correctly
        all_season_sim_stats_list = []
        for _ in range(num_seasons_per_eval):
            ss_outcomes = season_simulator_func(target_pa, current_event_probs)
            all_season_sim_stats_list.append(stats_calculator_func(ss_outcomes))
        
        # Average the calculated ratios and counts from the list of dicts
        # For ratios (BA, OBP, SLG, K_rate, BB_rate)
        avg_sim_ratios = {
            stat: sum(s[stat] for s in all_season_sim_stats_list) / num_seasons_per_eval
            for stat in ["BA", "OBP", "SLG", "K_rate", "BB_rate"]
        }
        # For counts (HR, BB, K, H, AB, PA, 1B, 2B, OUT)
        avg_sim_counts_for_error = {
            count_stat: sum(s[count_stat_key] for s in all_season_sim_stats_list) / num_seasons_per_eval
            for count_stat, count_stat_key in [
                ("HR_count", "HR_count"), ("BB_count", "BB_count"), ("K_count", "K_count")
                # Add other counts if they are directly part of error calculation beyond ratios
            ]
        }
        # Merge counts into the dict passed to calculate_error_with_anchor
        # The calculate_error_with_anchor function expects sim_stats to have these keys
        sim_stats_for_error = {**avg_sim_ratios, **avg_sim_counts_for_error}


        current_total_error_val = calculate_error_with_anchor(
            sim_stats_for_error,
            target_ratios,
            target_counts,
            current_trial_abilities,
            anchor_abilities,
            error_weights,
            deviation_penalty_weight
        )

        if current_total_error_val < min_total_error:
            min_total_error = current_total_error_val
            best_pow = current_pow
            best_hit = current_hit
            best_eye = current_eye

        if (i + 1) % (num_iterations // 10 or 1) == 0:
            print(f"  迭代 {i+1}/{num_iterations}: 當前總誤差 {min_total_error:.4f} (POW:{best_pow:.2f}, HIT:{best_hit:.2f}, EYE:{best_eye:.2f})")

    print(f"\n為 {player_name} 自動迭代搜索完成 (含錨點懲罰)！")
    print(f"找到的最佳 POW, HIT, EYE 組合為：")
    print(f"  POW: {best_pow:.2f}")
    print(f"  HIT: {best_hit:.2f}")
    print(f"  EYE: {best_eye:.2f}")
    print(f"  對應的最小總誤差: {min_total_error:.4f}")
    
    return {"POW": best_pow, "HIT": best_hit, "EYE": best_eye}, min_total_error