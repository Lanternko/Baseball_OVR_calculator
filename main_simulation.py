# main_simulation.py
import random
import math

from game_constants import (
    NUM_PA_PER_SEASON_ARCHETYPE, NUM_SEASONS_FOR_EVALUATION,
    NUM_SEASONS_FOR_FINAL_RUN, NUM_ITERATIONS_FOR_OPTIMIZATION,
    ERROR_WEIGHTS, DEVIATION_PENALTY_WEIGHT, ATTRIBUTE_SEARCH_RANGE_DELTA
)
from player_data import (
    get_judge_anchor_abilities, get_judge_target_data,
    get_goldschmidt_anchor_abilities, get_goldschmidt_target_data,
    get_arcia_anchor_abilities, get_arcia_target_data,
    get_ohtani_anchor_abilities, get_ohtani_target_data,
    get_freeman_anchor_abilities, get_freeman_target_data, # 新增 Freeman
    ARCHETYPES_DATA
)
from probability_model import get_pa_event_probabilities
from simulation_engine import simulate_season, calculate_sim_stats
from optimization_utils import find_best_attributes_random_search

PRINT_EVENT_PROBABILITIES = True 

def run_archetype_calibration():
    print("\n--- 開始原型球員校準測試 (使用新的非線性SB2因子) ---")
    for archetype_name, data in ARCHETYPES_DATA.items():
        player_pow = data["POW"]
        player_hit = data["HIT"]
        player_eye = data["EYE"]
        player_hbp_rate = data["HBP_rate"]
        target_rates = data["Target_Rate"]
        target_counts_main = data["Target_Count"]

        event_probs = get_pa_event_probabilities(
            player_pow, player_hit, player_eye, player_hbp_rate
        )
        
        if PRINT_EVENT_PROBABILITIES:
            print(f"\n{archetype_name} - 模擬用 PA 事件機率:")
            prob_sum_check = sum(event_probs.values())
            for event, prob in event_probs.items(): print(f"  P({event}): {prob:.5f}")
            print(f"  機率總和: {prob_sum_check:.5f}")
            if abs(prob_sum_check - 1.0) > 1e-5:
                print(f"  警告: 機率總和 ({prob_sum_check:.5f}) 與 1.0 偏差過大！")

        all_sim_stats_list_archetype = []
        num_pa_archetype = target_counts_main.get('PA', NUM_PA_PER_SEASON_ARCHETYPE)

        print(f"\n正在為 {archetype_name} (POW={player_pow}, HIT={player_hit}, EYE={player_eye}) 模擬 {NUM_SEASONS_FOR_FINAL_RUN} 個賽季...")
        print_interval = NUM_SEASONS_FOR_FINAL_RUN // 4 
        if print_interval == 0: print_interval = 1 

        for i in range(NUM_SEASONS_FOR_FINAL_RUN):
            if (i + 1) % print_interval == 0 or (i + 1) == NUM_SEASONS_FOR_FINAL_RUN:
                print(f"  {archetype_name}: 已完成 {i + 1}/{NUM_SEASONS_FOR_FINAL_RUN} 個賽季...")
            single_season_outcomes = simulate_season(num_pa_archetype, event_probs)
            all_sim_stats_list_archetype.append(calculate_sim_stats(single_season_outcomes))
        
        avg_BA_archetype = sum(s['BA'] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN
        avg_OBP_archetype = sum(s['OBP'] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN
        avg_SLG_archetype = sum(s['SLG'] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN
        avg_OPS_archetype = sum(s['OPS'] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN
        avg_K_rate_archetype = sum(s['K_rate'] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN
        avg_BB_rate_archetype = sum(s['BB_rate'] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN

        avg_counts_archetype = {
            stat_key_internal: sum(s[stat_key_internal+"_count"] for s in all_sim_stats_list_archetype) / NUM_SEASONS_FOR_FINAL_RUN
            for stat_key_internal in ["HR", "BB", "K", "H", "AB", "PA", "_1B", "_2B", "OUT"]
        }
        print(f"{archetype_name} 模擬完成！")

        print(f"\n--- {archetype_name}：{NUM_SEASONS_FOR_FINAL_RUN} 次模擬平均結果 vs 目標數據 ---")
        print(f"使用的遊戲屬性: POW={player_pow}, HIT={player_hit}, EYE={player_eye}")
        
        print(f"\n平均計數數據比較:")
        print(f"{'事件':<9} | {'平均模擬值':<12} | {'目標值':<17}")
        print(f"---------|--------------|------------------")
        
        key_stats_to_print = [("HR", "HR_target"), ("K", "K_target"), ("PA", "PA_target"), ("BB", "BB_target")]
        for stat_print, target_key in key_stats_to_print:
            sim_val_key = stat_print 
            sim_display_val = avg_counts_archetype.get(sim_val_key, 'N/A')
            target_display_val = target_counts_main.get(target_key, 'N/A')
            sim_display_str = f"{sim_display_val:<12.1f}" if isinstance(sim_display_val, (int,float)) else f"{str(sim_display_val):<12}"
            target_display_str = str(target_display_val) if target_display_val != 'N/A' else 'N/A  ' 
            print(f"{stat_print:<9} | {sim_display_str} | {target_display_str:<6}")

        print("\n平均比率數據比較:")
        print(f"{'比率':<9} | {'平均模擬值':<12} | {'目標值':<17}")
        print(f"---------|--------------|------------------")
        rate_stats_to_print = [("BA", "BA"), ("OBP", "OBP"), ("SLG", "SLG"), ("OPS", "OPS"), ("K_rate", "K_rate"), ("BB_rate", "BB_rate")]
        for rate_print, target_key_rate in rate_stats_to_print:
            avg_val_to_print = locals().get(f"avg_{rate_print}_archetype", -1)
            if avg_val_to_print == -1 and rate_print == "OPS": 
                 avg_val_to_print = avg_OBP_archetype + avg_SLG_archetype
            
            target_val = target_rates.get(target_key_rate, 'N/A')
            target_val_str = f"{target_val:.3f}" if isinstance(target_val, (int, float)) else str(target_val)
            print(f"{rate_print:<9} | {avg_val_to_print:<12.3f} | {target_val_str}")

    print("\n--- 原型球員校準測試結束 ---")
    print("如果原型不符合預期，請調整 game_constants.py 中的非線性模型參數，然後重新運行此校準測試。")

def run_player_optimization_and_final_sim(player_name, anchor_abilities_func, target_data_func, custom_error_weights=None):
    anchor_abilities = anchor_abilities_func()
    target_pa, target_counts, target_ratios, player_hbp_rate = target_data_func()

    current_error_weights = custom_error_weights if custom_error_weights is not None else ERROR_WEIGHTS

    print(f"\n===== {player_name} Optimization =====")
    if custom_error_weights:
        print(f"使用特定誤差權重: K={current_error_weights.get('K', ERROR_WEIGHTS.get('K'))}, BB={current_error_weights.get('BB', ERROR_WEIGHTS.get('BB'))}")
    else:
        print(f"使用全局誤差權重: K={ERROR_WEIGHTS.get('K')}, BB={ERROR_WEIGHTS.get('BB')}")
        
    print(f"{player_name} 的錨點能力值 (基於x-stats轉換):")
    print(f"  POW_anchor: {anchor_abilities['POW']:.2f}")
    print(f"  HIT_anchor: {anchor_abilities['HIT']:.2f}")
    print(f"  EYE_anchor: {anchor_abilities['EYE']:.2f}")
    
    pow_range = (max(1, anchor_abilities['POW'] - ATTRIBUTE_SEARCH_RANGE_DELTA), 
                 min(150, anchor_abilities['POW'] + ATTRIBUTE_SEARCH_RANGE_DELTA))
    hit_range = (max(1, anchor_abilities['HIT'] - ATTRIBUTE_SEARCH_RANGE_DELTA), 
                 min(150, anchor_abilities['HIT'] + ATTRIBUTE_SEARCH_RANGE_DELTA))
    eye_range = (max(1, anchor_abilities['EYE'] - ATTRIBUTE_SEARCH_RANGE_DELTA), 
                 min(150, anchor_abilities['EYE'] + ATTRIBUTE_SEARCH_RANGE_DELTA))
    pow_range = (pow_range[0], max(pow_range[0], pow_range[1]))
    hit_range = (hit_range[0], max(hit_range[0], hit_range[1]))
    eye_range = (eye_range[0], max(eye_range[0], eye_range[1]))

    if PRINT_EVENT_PROBABILITIES:
        print(f"\n{player_name} POW 搜索範圍: ({pow_range[0]:.2f}, {pow_range[1]:.2f})")
        print(f"{player_name} HIT 搜索範圍: ({hit_range[0]:.2f}, {hit_range[1]:.2f})")
        print(f"{player_name} EYE 搜索範圍: ({eye_range[0]:.2f}, {eye_range[1]:.2f})")
    
    best_attrs, min_err = find_best_attributes_random_search(
        player_name=player_name,
        anchor_abilities=anchor_abilities,
        target_pa=target_pa,
        target_counts=target_counts,
        target_ratios=target_ratios,
        player_hbp_rate=player_hbp_rate,
        error_weights=current_error_weights, 
        deviation_penalty_weight=DEVIATION_PENALTY_WEIGHT,
        prob_calculator_func=get_pa_event_probabilities,
        season_simulator_func=simulate_season,
        stats_calculator_func=calculate_sim_stats,
        pow_search_range=pow_range,
        hit_search_range=hit_range,
        eye_search_range=eye_range,
        num_iterations=NUM_ITERATIONS_FOR_OPTIMIZATION,
        num_seasons_per_eval=NUM_SEASONS_FOR_EVALUATION
    )

    print(f"\n--- {player_name}: 最終模擬確認 ({NUM_SEASONS_FOR_FINAL_RUN}個賽季) ---")
    final_event_probs = get_pa_event_probabilities(
        best_attrs['POW'], best_attrs['HIT'], best_attrs['EYE'], player_hbp_rate
    )
    
    final_all_sim_stats_list = []
    print(f"正在為 {player_name} (POW={best_attrs['POW']:.2f}, HIT={best_attrs['HIT']:.2f}, EYE={best_attrs['EYE']:.2f}) 模擬 {NUM_SEASONS_FOR_FINAL_RUN} 個賽季...")
    print_interval_final = NUM_SEASONS_FOR_FINAL_RUN // 4
    if print_interval_final == 0: print_interval_final = 1

    for i in range(NUM_SEASONS_FOR_FINAL_RUN):
        if (i + 1) % print_interval_final == 0 or (i + 1) == NUM_SEASONS_FOR_FINAL_RUN:
            print(f"  {player_name} 確認模擬: 已完成 {i + 1}/{NUM_SEASONS_FOR_FINAL_RUN} 個賽季...")
        ss_outcomes = simulate_season(target_pa, final_event_probs)
        final_all_sim_stats_list.append(calculate_sim_stats(ss_outcomes))

    avg_final_BA = sum(s['BA'] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN
    avg_final_OBP = sum(s['OBP'] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN
    avg_final_SLG = sum(s['SLG'] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN
    avg_final_OPS = sum(s['OPS'] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN
    avg_final_K_rate = sum(s['K_rate'] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN
    avg_final_BB_rate = sum(s['BB_rate'] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN

    avg_final_counts = {
        stat_key_internal: sum(s[stat_key_internal+"_count"] for s in final_all_sim_stats_list) / NUM_SEASONS_FOR_FINAL_RUN
        for stat_key_internal in ["HR", "BB", "K", "H", "AB", "PA", "_1B", "_2B", "OUT"]
    }
    print(f"{player_name} 最終確認模擬完成！")

    print(f"\n--- {player_name} (POW={best_attrs['POW']:.2f}, HIT={best_attrs['HIT']:.2f}, EYE={best_attrs['EYE']:.2f})：模擬 vs 真實 ---")
    
    print(f"{'事件':<9} | {'平均模擬值':<12} | {'真實值':<17}")
    print(f"---------|--------------|------------------")
    
    target_total_outs = target_pa - target_counts.get("H_target",0) - target_counts.get("BB_target",0) - target_counts.get("HBP_target",0)
    sim_hbp_count = target_pa * player_hbp_rate

    display_order = [
        ("PA", "PA_target", "PA"), ("AB", "AB_target", "AB"),
        ("H", "H_target", "H"), ("HR", "HR_target", "HR"),
        ("2B", "_2B_target", "_2B"), ("1B", "_1B_target", "_1B"),
        ("BB", "BB_target", "BB"), ("K", "K_target", "K"),
        ("HBP", "HBP_target", None), 
        ("OUT", None, "OUT") 
    ]

    for disp_name, target_key, sim_key_prefix in display_order:
        sim_val_key = sim_key_prefix if sim_key_prefix else "" 
        sim_val = avg_final_counts.get(sim_val_key, 0)
        if disp_name == "HBP": sim_val = sim_hbp_count
        
        target_val_str = str(target_counts.get(target_key, 'N/A')) if target_key else str(round(target_total_outs))
        
        print(f"{disp_name:<9} | {sim_val:<12.1f} | {target_val_str:<6}")

    print("\n平均比率數據比較:")
    print(f"{'比率':<9} | {'平均模擬值':<12} | {'真實值':<17}")
    print(f"---------|--------------|------------------")
    print(f"{'BA':<9} | {avg_final_BA:<12.3f} | {target_ratios.get('BA',0):.3f}")
    print(f"{'OBP':<9} | {avg_final_OBP:<12.3f} | {target_ratios.get('OBP',0):.3f}")
    print(f"{'SLG':<9} | {avg_final_SLG:<12.3f} | {target_ratios.get('SLG',0):.3f}")
    print(f"{'OPS':<9} | {avg_final_OPS:<12.3f} | {target_ratios.get('OPS',0):.3f}")
    print(f"{'K_rate':<9} | {avg_final_K_rate:<12.3f} | {target_ratios.get('K_rate',0):.3f}")
    print(f"{'BB_rate':<9} | {avg_final_BB_rate:<12.3f} | {target_ratios.get('BB_rate',0):.3f}")

def run_player_direct_simulation(player_name, anchor_abilities_func, target_data_func, num_seasons=NUM_SEASONS_FOR_FINAL_RUN):
    print(f"\n===== {player_name} Direct Simulation Test =====")
    anchor_abilities = anchor_abilities_func()
    target_pa, target_counts, target_ratios, player_hbp_rate = target_data_func()

    print(f"{player_name} 的錨點能力值 (基於x-stats轉換):")
    print(f"  POW_anchor: {anchor_abilities['POW']:.2f}")
    print(f"  HIT_anchor: {anchor_abilities['HIT']:.2f}")
    print(f"  EYE_anchor: {anchor_abilities['EYE']:.2f}")
    
    direct_event_probs = get_pa_event_probabilities(
        anchor_abilities['POW'], anchor_abilities['HIT'], anchor_abilities['EYE'], player_hbp_rate
    )
    
    if PRINT_EVENT_PROBABILITIES:
        print(f"\n{player_name} - 直接模擬用 PA 事件機率:")
        prob_sum_check = sum(direct_event_probs.values())
        for event, prob in direct_event_probs.items(): print(f"  P({event}): {prob:.5f}")
        print(f"  機率總和: {prob_sum_check:.5f}")
        if abs(prob_sum_check - 1.0) > 1e-5:
            print(f"  警告: 機率總和 ({prob_sum_check:.5f}) 與 1.0 偏差過大！")

    all_direct_sim_stats_list = []
    print(f"正在為 {player_name} (POW={anchor_abilities['POW']:.2f}, HIT={anchor_abilities['HIT']:.2f}, EYE={anchor_abilities['EYE']:.2f}) 模擬 {num_seasons} 個賽季...")
    print_interval_direct = num_seasons // 4
    if print_interval_direct == 0: print_interval_direct = 1
    
    for i in range(num_seasons):
        if (i + 1) % print_interval_direct == 0 or (i + 1) == num_seasons:
            print(f"  {player_name} 直接模擬: 已完成 {i + 1}/{num_seasons} 個賽季...")
        ss_outcomes = simulate_season(target_pa, direct_event_probs)
        all_direct_sim_stats_list.append(calculate_sim_stats(ss_outcomes))

    avg_direct_BA = sum(s['BA'] for s in all_direct_sim_stats_list) / num_seasons
    avg_direct_OBP = sum(s['OBP'] for s in all_direct_sim_stats_list) / num_seasons
    avg_direct_SLG = sum(s['SLG'] for s in all_direct_sim_stats_list) / num_seasons
    avg_direct_OPS = sum(s['OPS'] for s in all_direct_sim_stats_list) / num_seasons
    avg_direct_K_rate = sum(s['K_rate'] for s in all_direct_sim_stats_list) / num_seasons
    avg_direct_BB_rate = sum(s['BB_rate'] for s in all_direct_sim_stats_list) / num_seasons

    avg_direct_counts = {
        stat_key_internal: sum(s[stat_key_internal+"_count"] for s in all_direct_sim_stats_list) / num_seasons
        for stat_key_internal in ["HR", "BB", "K", "H", "AB", "PA", "_1B", "_2B", "OUT"]
    }
    print(f"{player_name} 直接模擬完成！")

    print(f"\n--- {player_name} (POW={anchor_abilities['POW']:.2f}, HIT={anchor_abilities['HIT']:.2f}, EYE={anchor_abilities['EYE']:.2f})：模擬 vs 真實 ---")
    
    print(f"{'事件':<9} | {'平均模擬值':<12} | {'真實值':<17}")
    print(f"---------|--------------|------------------")
    
    target_total_outs = target_pa - target_counts.get("H_target",0) - target_counts.get("BB_target",0) - target_counts.get("HBP_target",0)
    sim_hbp_count = target_pa * player_hbp_rate

    display_order = [
        ("PA", "PA_target", "PA"), ("AB", "AB_target", "AB"),
        ("H", "H_target", "H"), ("HR", "HR_target", "HR"),
        ("2B", "_2B_target", "_2B"), ("1B", "_1B_target", "_1B"),
        ("BB", "BB_target", "BB"), ("K", "K_target", "K"),
        ("HBP", "HBP_target", None), 
        ("OUT", None, "OUT") 
    ]

    for disp_name, target_key, sim_key_prefix in display_order:
        sim_val_key = sim_key_prefix if sim_key_prefix else ""
        sim_val = avg_direct_counts.get(sim_val_key, 0)
        if disp_name == "HBP": sim_val = sim_hbp_count
        
        target_val_str = str(target_counts.get(target_key, 'N/A')) if target_key else str(round(target_total_outs))
        
        print(f"{disp_name:<9} | {sim_val:<12.1f} | {target_val_str:<6}")

    print("\n平均比率數據比較:")
    print(f"{'比率':<9} | {'平均模擬值':<12} | {'真實值':<17}")
    print(f"---------|--------------|------------------")
    print(f"{'BA':<9} | {avg_direct_BA:<12.3f} | {target_ratios.get('BA',0):.3f}")
    print(f"{'OBP':<9} | {avg_direct_OBP:<12.3f} | {target_ratios.get('OBP',0):.3f}")
    print(f"{'SLG':<9} | {avg_direct_SLG:<12.3f} | {target_ratios.get('SLG',0):.3f}")
    print(f"{'OPS':<9} | {avg_direct_OPS:<12.3f} | {target_ratios.get('OPS',0):.3f}")
    print(f"{'K_rate':<9} | {avg_direct_K_rate:<12.3f} | {target_ratios.get('K_rate',0):.3f}")
    print(f"{'BB_rate':<9} | {avg_direct_BB_rate:<12.3f} | {target_ratios.get('BB_rate',0):.3f}")
    print("="*50)


if __name__ == "__main__":
    run_archetype_calibration()

    # run_player_direct_simulation(
    #     player_name="Orlando Arcia (2024 Anchor)",
    #     anchor_abilities_func=get_arcia_anchor_abilities,
    #     target_data_func=get_arcia_target_data
    # )
    
    run_player_direct_simulation( 
        player_name="Shohei Ohtani (2024 Anchor)",
        anchor_abilities_func=get_ohtani_anchor_abilities,
        target_data_func=get_ohtani_target_data
    )

    run_player_direct_simulation( # Freddie Freeman Direct Simulation
        player_name="Freddie Freeman (2023 Anchor)",
        anchor_abilities_func=get_freeman_anchor_abilities,
        target_data_func=get_freeman_target_data
    )

    # --- Aaron Judge Optimization with GLOBAL Weights ---
    print("\n" + "="*30 + " Aaron Judge Optimization " + "="*30)
    run_player_optimization_and_final_sim(
        player_name="Aaron Judge",
        anchor_abilities_func=get_judge_anchor_abilities,
        target_data_func=get_judge_target_data
    )
    
    # --- Paul Goldschmidt Optimization with Global Weights ---
    print("\n" + "="*30 + " Paul Goldschmidt Optimization " + "="*30)
    run_player_optimization_and_final_sim(
        player_name="Paul Goldschmidt",
        anchor_abilities_func=get_goldschmidt_anchor_abilities,
        target_data_func=get_goldschmidt_target_data
    )
    
    # --- Shohei Ohtani Optimization with Global Weights ---
    print("\n" + "="*30 + " Shohei Ohtani Optimization " + "="*30) 
    run_player_optimization_and_final_sim(
        player_name="Shohei Ohtani", 
        anchor_abilities_func=get_ohtani_anchor_abilities,
        target_data_func=get_ohtani_target_data
    )

    # --- Freddie Freeman Optimization with Global Weights ---
    print("\n" + "="*30 + " Freddie Freeman Optimization " + "="*30)
    run_player_optimization_and_final_sim(
        player_name="Freddie Freeman",
        anchor_abilities_func=get_freeman_anchor_abilities,
        target_data_func=get_freeman_target_data
    )
