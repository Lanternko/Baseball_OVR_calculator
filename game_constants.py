# game_constants.py

# 聯盟百分位基準值
LEAGUE_BENCHMARKS = {
    'xBA': {'pr1': 0.200, 'pr50': 0.250, 'pr99': 0.330},
    'xSLG': {'pr1': 0.310, 'pr50': 0.400, 'pr99': 0.640},
    'xwOBA': {'pr1': 0.260, 'pr50': 0.320, 'pr99': 0.430}
}
ATTRIBUTE_MAPPING_POINTS = {'pr1': 40, 'pr50': 70, 'pr99': 99}

# 模擬參數
NUM_PA_PER_SEASON_ARCHETYPE = 600
NUM_PA_PER_SEASON_JUDGE = 704
NUM_PA_PER_SEASON_GOLDSCHMIDT = 654
NUM_PA_PER_SEASON_OHTANI = 731
NUM_PA_PER_SEASON_ARCIA = 602
NUM_PA_PER_SEASON_FREEMAN = 730 # Freddie Freeman 2023 PA

NUM_SEASONS_FOR_EVALUATION = 100
NUM_SEASONS_FOR_FINAL_RUN = 1000
NUM_ITERATIONS_FOR_OPTIMIZATION = 200

# 誤差計算權重 (全局)
ERROR_WEIGHTS = {
    "BA": 1.5, "OBP": 1.8, "SLG": 1.5, "HR": 2.0, # Increased HR weight
    "BB": 0.8,
    "K": 0.8
}
DEVIATION_PENALTY_WEIGHT = 0.05
ATTRIBUTE_SEARCH_RANGE_DELTA = 25

# --- Non-Linear Model Parameters ---
ATTR_EFFECT_MIDPOINT = 70.0 # General midpoint for attribute scaling

# Strikeout Rate (K%) Parameters
AVG_K_RATE_AT_MIDPOINT = 0.220
MIN_K_RATE = 0.145
MAX_K_RATE = 0.29
K_RATE_EYE_WEIGHT = 0.50
K_RATE_HIT_WEIGHT = 0.50
K_EYE_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
K_EYE_EFFECT_SCALE = 70.0
K_HIT_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
K_HIT_EFFECT_SCALE = 70.0

# Walk Rate (BB%) Parameters
AVG_BB_RATE_AT_MIDPOINT = 0.085
MIN_BB_RATE = 0.065
MAX_BB_RATE = 0.18
BB_EYE_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
BB_EYE_EFFECT_SCALE = 70.0

# --- NEW Home Run Model Parameters ---
# S-Curve for Base HR Rate from POW (HR per PA)
# Format: [(POW_value, HR_Rate_per_PA), ...]
# These points will be used for linear interpolation.
HR_S_CURVE_POW_ANCHORS = [
    (0, 0.0005),  # Very low HR rate for POW 0
    (30, 0.003),  # Slightly more for low POW
    (40, 0.0067), # Target for PR1 (4 HR / 600 PA)
    (60, 0.020),  # Approaching midpoint
    (70, 0.0333), # Target for PR50 (20 HR / 600 PA) - Midpoint of the curve
    (85, 0.050),  # Steep part of the curve
    (99, 0.0667), # Target for PR99 (40 HR / 600 PA)
    (115, 0.085), # Diminishing returns start
    (130, 0.100), # Target for extreme POW (60 HR / 600 PA)
    (150, 0.115)  # Near practical max, still slight increase
]
ABSOLUTE_MAX_HR_RATE_CAP = 0.18 # An absolute ceiling for P(HR) after modifiers

# Modifiers for Base HR Rate
# EYE Modifier on HR (e.g., better EYE helps select better pitches to drive)
HR_EYE_MODIFIER_MIDPOINT = ATTR_EFFECT_MIDPOINT
HR_EYE_MODIFIER_SCALE = 30.0  # How sensitive the modifier is to EYE attribute
HR_EYE_MODIFIER_MAX_IMPACT = 0.15 # Max +/- percentage impact (e.g., 0.15 means +/- 15%)

# HIT Modifier on HR (e.g., better HIT makes better contact quality for power to translate)
HR_HIT_MODIFIER_MIDPOINT = ATTR_EFFECT_MIDPOINT
HR_HIT_MODIFIER_SCALE = 30.0
HR_HIT_MODIFIER_MAX_IMPACT = 0.20 # HIT might have a slightly larger impact on HR quality

# --- OLD Home Run Rate (HR% per PA) Parameters (Commented out, to be replaced) ---
# AVG_HR_RATE_AT_MIDPOINT = 0.033
# MIN_HR_RATE = 0.005
# MAX_HR_RATE = 0.080
# HR_POW_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
# HR_POW_EFFECT_SCALE = 70.0

# --- Ball In Play (BIP) Outcomes Parameters ---
# BABIP (Batting Average on Balls In Play)
AVG_BABIP_AT_MIDPOINT = 0.300
MIN_BABIP_RATE = 0.245
MAX_BABIP_RATE = 0.345
BABIP_HIT_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
BABIP_HIT_EFFECT_SCALE = 45.0

# Extra-Base Hit (2B) Ratio from Hits on Balls In Play (P(2B | Hit_BIP_not_HR))
# This will now apply to hits that are not HRs (calculated by the new HR model)
AVG_2B_PER_HIT_BIP_NOT_HR_AT_MIDPOINT = 0.28 # Slightly higher as HRs are removed from the pool
MIN_2B_PER_HIT_BIP_NOT_HR = 0.18
MAX_2B_PER_HIT_BIP_NOT_HR = 0.38
EXTRABASE_POW_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
EXTRABASE_POW_EFFECT_SCALE = 48.0
EXTRABASE_HIT_EFFECT_MIDPOINT = ATTR_EFFECT_MIDPOINT
EXTRABASE_HIT_EFFECT_SCALE = 48.0
EXTRABASE_POW_WEIGHT = 0.60 # POW has a bit more say in 2B vs 1B
EXTRABASE_HIT_WEIGHT = 0.40

# League Average HBP Rate
LEAGUE_AVG_HBP_RATE = 0.010


# --- PLACEHOLDERS for Future Advanced Model (ECR & PXBHC) ---
# Effective Contact Rate (ECR) - Placeholder Parameters
AVG_ECR_RATE_AT_MIDPOINT = 0.75 # Placeholder: % of non-K, non-BB, non-HBP that are "effective contact"
MIN_ECR_RATE = 0.60
MAX_ECR_RATE = 0.90
ECR_EYE_WEIGHT = 0.60       # EYE is more important for making contact
ECR_HIT_WEIGHT = 0.40       # HIT helps solidify contact
ECR_EYE_MIDPOINT = ATTR_EFFECT_MIDPOINT
ECR_EYE_SCALE = 30.0
ECR_HIT_MIDPOINT = ATTR_EFFECT_MIDPOINT
ECR_HIT_SCALE = 35.0

# Potential Extra-Base Hit Contact Rate (PXBHC_of_ECR) - Placeholder Parameters
# % of "Effective Contacts" that have potential to be XBH (good launch angle/exit velo)
AVG_PXBHC_RATE_AT_MIDPOINT = 0.40 # Placeholder
MIN_PXBHC_RATE = 0.20
MAX_PXBHC_RATE = 0.65
PXBHC_HIT_MIDPOINT = ATTR_EFFECT_MIDPOINT # HIT is primary driver here
PXBHC_HIT_SCALE = 25.0
# PXBHC_POW_WEIGHT = 0.3 # POW might slightly influence this too (harder hit = more XBH potential)
# PXBHC_HIT_WEIGHT = 0.7
