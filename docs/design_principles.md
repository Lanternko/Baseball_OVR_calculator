# Baseball Algorithm Design Principles

> **Core Philosophy**: Maintain bidirectional conversion accuracy while respecting MLB statistical distributions and attribute interaction effects.

## 🎯 Fundamental Design Dogmas

### 1. **Benchmark Stability Principle**
- **NEVER change LEAGUE_BENCHMARKS without extreme justification**
- Benchmarks represent MLB statistical reality and should remain stable
- Current benchmarks based on README MLB ranges:
  ```javascript
  'xBA': {'pr1': 0.210, 'pr50': 0.250, 'pr99': 0.320}
  'xSLG': {'pr1': 0.320, 'pr50': 0.420, 'pr99': 0.570}
  'xwOBA': {'pr1': 0.280, 'pr50': 0.320, 'pr99': 0.420}
  ```
- **Fix anchor points and model parameters, NOT benchmarks**

### 2. **Hierarchical Testing Approach**
Must follow this exact sequence when debugging bidirectional conversion:

#### Phase 1: Foundation Validation
1. **Test isolated attributes** (70/99/70, 99/70/70, 70/70/99)
   - Verify each attribute produces its benchmark target
   - Adjust anchor points if needed
2. **Test league average** (70/70/70)
   - Should have minimal bidirectional error (<5 total)
   - This is the calibration cornerstone

#### Phase 2: Homogeneous Groups
3. **Test same-level combinations** (40/40/40, 99/99/99)
   - Acceptable bidirectional error: <10 total
   - If fails, check attribute interaction effects

#### Phase 3: Mixed Combinations
4. **Test mixed combinations** (40/70/99, etc.)
   - Expected higher error due to interaction complexity
   - Use iterative optimization if needed

### 3. **Attribute Interaction Acknowledgment**
- **Accept that mixed attributes are inherently difficult**
- Don't over-optimize for mixed combinations at the expense of foundation
- Attribute effects are multiplicative, not additive
- Example: HIT 99 performs differently with EYE 40 vs EYE 99

### 4. **Model Parameter Hierarchy**
When adjusting model parameters, follow this order:

#### Priority 1: Anchor Points (S-Curve breakpoints)
- `HR_S_CURVE_POW_ANCHORS`
- `BABIP_S_CURVE_HIT_ANCHORS` 
- `BB_S_CURVE_EYE_ANCHORS`

#### Priority 2: Interaction Effects
- HIT/EYE modifiers on HR rate (currently 0.02/0.03)
- Cross-attribute influence parameters

#### Priority 3: Caps and Limits
- Only adjust as last resort
- Document reasoning extensively

### 5. **Change Documentation Principle**
Every parameter change must include:
- **Why**: Specific test failure being addressed
- **What**: Exact parameter and value change
- **Expected**: Quantified improvement expectation
- **Tested**: Verification of improvement

## 🔬 Testing Standards

### Bidirectional Accuracy Targets
- **Excellent**: <3 total error per attribute
- **Good**: <6 total error per attribute  
- **Acceptable**: <15 total error per attribute
- **Unacceptable**: >15 total error per attribute

### Core Test Cases (Must Always Pass)
1. **70/70/70**: Total error <10 (Foundation test)
2. **40/40/40**: Total error <15 (Low-end stability)
3. **99/99/99**: Total error <20 (High-end acceptable given complexity)

### Benchmark Validation Tests
- **POW 99** with HIT=70, EYE=70 → SLG ~0.570 ±0.030
- **HIT 99** with POW=70, EYE=70 → BA ~0.320 ±0.020
- **EYE 99** with POW=70, HIT=70 → OBP ~0.420 ±0.025

## 🚫 Anti-Patterns to Avoid

### 1. **Benchmark Chasing**
- ❌ Adjusting benchmarks to match current output
- ✅ Adjusting model to match benchmark targets

### 2. **Mixed-Attribute Optimization**
- ❌ Over-tuning for complex mixed combinations
- ✅ Ensuring foundation (70/70/70) accuracy first

### 3. **Parameter Thrashing**
- ❌ Changing multiple parameters simultaneously
- ✅ Systematic, single-parameter adjustments

### 4. **Extreme Value Focus**
- ❌ Optimizing only for 99/99/99 combinations
- ✅ Balanced approach across all ranges

## 🛠️ Implementation Guidelines

### Iterative Optimization Protocol
For stat-to-attribute conversion accuracy:

1. **Use mathematical optimization**, not formula guessing
2. **Reference old_python_calculate_models/optimization_utils.py**
3. **Implement two-stage search**:
   - Stage 1: Broad random search
   - Stage 2: Fine-tuned optimization around best candidates
4. **Minimize total error** across multiple stat combinations

### Model Architecture Principles
- **Separation of Concerns**: Keep anchor points, benchmarks, and interaction effects separate
- **Transparency**: All magic numbers should be named constants with comments
- **Modularity**: Enable easy A/B testing of different parameter sets
- **Reproducibility**: Fixed random seeds for testing

## 📊 Success Metrics

### System Health Indicators
1. **Foundation Stability**: 70/70/70 consistently <10 error
2. **Range Coverage**: All 40-99 combinations show reasonable accuracy
3. **MLB Compliance**: Isolated attributes hit benchmark targets
4. **Bidirectional Consistency**: Conversion cycles maintain <15% drift

### Performance Benchmarks
- **Processing Speed**: <1s for single conversion
- **Accuracy**: 80%+ of test cases achieve "Good" or better
- **Stability**: Results consistent across multiple test runs

---

## ⚖️ Decision Framework

When facing conversion accuracy issues:

```
1. Is the 70/70/70 foundation solid?
   └─ No → Fix anchor points
   └─ Yes → Continue

2. Do isolated attributes hit benchmarks?
   └─ No → Adjust relevant anchor points  
   └─ Yes → Continue

3. Are mixed combinations the problem?
   └─ Yes → Consider iterative optimization
   └─ No → Review interaction effects
```

## 🔄 Review and Evolution

This document should be:
- **Reviewed** before any major parameter changes
- **Updated** when new insights emerge
- **Referenced** in all debugging sessions
- **Preserved** as the source of truth

**Remember**: The goal is not perfect accuracy for all combinations, but systematic, principled improvement that maintains MLB realism and bidirectional consistency.

---

*"Perfect is the enemy of good. Systematic is the friend of maintainable."*