// woba_ovr_mapping.js (stub)
// 本檔為相容性佔位檔，避免 404 與 MIME 錯誤。
// 之後若需要可在此放入實際 wOBA ↔ OVR 轉換表。

(function(){
  const msg = '[woba_ovr_mapping] stub loaded';
  if (typeof window !== 'undefined') {
    window.WOBA_OVR_MAPPING = window.WOBA_OVR_MAPPING || {};
    console.log(msg);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
    console.log(msg);
  }
})();

