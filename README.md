# ⚾ 棒球OVR計算器 (Baseball Attribute Calculator)
這是一個基於 POW / HIT / EYE 三圍系統的棒球數據模擬與預測工具。

您可以透過輸入球員的預期表現數據（如 xBA, xSLG）來反推出他的三圍能力值；
或者，您也可以直接輸入三圍數值，來模擬預測一位球員在完整賽季中可能打出的成績。

這個專案包含一個強大的 Python 後端模型，以及一個方便、免安裝的單頁式網頁計算機。

## ✨ 功能亮點
### 雙向轉換:

📊 數據 → 三圍: 從高階數據（xBA, xSLG, xwOBA）計算出球員的 POW, HIT, EYE 和綜合評價 (OVR)。

⚙️ 三圍 → 數據: 從三圍數值模擬預測球員的傳統數據（BA, OBP, SLG, HR 等）。

### 數據模擬: 底層使用蒙地卡羅方法，模擬上百個賽季以確保預測結果的穩定性與準確性。

綜合評價 (OVR): 內建一套綜合評價系統，根據三圍的均衡度、精英加成等因素，為球員計算出一個直觀的 OVR 分數。

免安裝，零設定: 網頁版計算機只需要一個 index.html 檔案，用任何現代瀏覽器打開即可使用，無需任何伺服器或環境設定。



## 🔬 模型核心概念
本模型圍繞著三個核心打者屬性來建構：

POW(Power) 力量：主要影響全壘打和長打的產出機率。
HIT(Hit technique) 擊球技巧：主要影響球打進場內形成安打的機率（BABIP），進而決定打擊率。
EYE(Plate Discipline)	選球能力：主要影響保送率 (BB%) 與三振率 (K%)。

## 🛠️ 開發者資訊
雖然網頁版非常方便，但本專案的核心研發與校準皆在 Python 後端完成。JavaScript 版本是 Python 核心邏輯的忠實移植。

模型源頭: 所有演算法的「真實來源 (Source of Truth)」都在 Python 檔案中。

主要模組:

game_constants.py: 存放所有模型參數，是調整模型的關鍵。

probability_model.py: 核心數學模型。

simulation_engine.py: 模擬器。

optimization_utils.py: 用於從真實數據反推最佳三圍的工具。

main_simulation.py: 主執行腳本，用於校準與測試。

如果您想對模型本身進行修改、研究或改進，請從 Python 檔案著手。
