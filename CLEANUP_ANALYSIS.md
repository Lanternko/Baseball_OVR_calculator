# 🧹 File Cleanup Analysis

## Current Status
- ✅ research_zen.html is now linked from main page
- 🔧 Fixed incorrect script imports in research_zen.html
- 📋 Ready to identify redundant files

## Files Analysis

### 🏠 **Core Files (KEEP - Essential)**
```
✅ index.html                 # Main application
✅ constants.js              # Model parameters
✅ probability_model.js      # Core calculations  
✅ simulation_engine.js      # Monte Carlo simulation
✅ ovr_calculator.js         # OVR calculation logic
✅ main.js                   # Main app logic
✅ style.css                 # Main styles
✅ player-card.js           # Card animations
✅ player-cards.css         # Card styles
✅ modal.css                # Modal styles
```

### 🔬 **Research Files (CHOOSE ONE)**
```
🆕 research_zen.html         # New zen interface (KEEP)
🗑️ research.html             # Old messy interface (REMOVE)
```

### 🧪 **Test Files (EVALUATE)**
```
✅ test_pow.html             # POW analysis (used by zen)
✅ test_hit.html             # HIT analysis (used by zen)  
✅ test_eye.html             # EYE analysis (used by zen)
✅ bidirectional_fixed.html  # Conversion tests (used by zen)
✅ test_debug.html           # Debug utilities (used by zen)
✅ comprehensive_test.html   # Full test suite (NEW, useful)

❓ test_pow.js               # Check if needed
❓ test_99_fix.js           # Legacy fix?
❓ test_babip.js            # BABIP testing?
❓ test_calibration.js      # Calibration testing?
❓ test_xbh_model.js        # Node.js version (broken)
❓ bidirectional_simple.html # Simpler version?
❓ bidirectional_test.html   # Another version?
```

### 🗂️ **Legacy/Redundant Files (LIKELY REMOVE)**
```
🗑️ ohtani_analysis.html     # Specific player analysis
🗑️ ohtani_simple.html       # Another Ohtani version
🗑️ quick_eye_test.js        # Quick test (replaced?)
🗑️ quick_hit_test.js        # Quick test (replaced?)
🗑️ test_xbh_model.html      # XBH test (incomplete)
🗑️ test_xbh_model.js        # XBH Node.js test (broken)
🗑️ 1.3reporter.html         # Old reporter
🗑️ run_hit_test.bat         # Batch file
```

### 📚 **Documentation (KEEP)**
```
✅ README.md
✅ design_principles.md  
✅ architecture.md
✅ 1.0report.md
```

## Safe Removal Candidates

### 🟢 **Very Safe to Remove**
- `research.html` - Replaced by research_zen.html
- `ohtani_analysis.html` - Specific analysis, no longer needed
- `ohtani_simple.html` - Duplicate specific analysis
- `test_xbh_model.js` - Broken Node.js version
- `run_hit_test.bat` - Batch file not needed

### 🟡 **Probably Safe to Remove**  
- `1.3reporter.html` - Old version
- `quick_eye_test.js` - Likely replaced by test_eye.html
- `quick_hit_test.js` - Likely replaced by test_hit.html
- `bidirectional_simple.html` - If bidirectional_fixed.html works
- `bidirectional_test.html` - If bidirectional_fixed.html works

### 🔴 **Check Before Removing**
- `test_pow.js` - May be imported by test_pow.html
- `test_99_fix.js` - May contain important fixes
- `test_babip.js` - May be used for BABIP testing
- `test_calibration.js` - May be used for calibration

## Recommendation

**Phase 1: Very Safe Cleanup**
Remove only the obviously redundant files that are 100% safe.

**Phase 2: Validation** 
Test that research_zen.html works completely before removing questionable files.

**Phase 3: Cautious Cleanup**
Remove remaining files only after verifying they're not imported anywhere.