# Developer Toolbox

整合「工程小工具」與「常用語法模板」的開發效率平台。

## 專案目標
Developer Toolbox 提供一個單一入口，讓開發者可以在同一個介面中：
- 使用常見互動工具（格式化、測試、模擬）
- 管理可重複使用的程式碼片段（Snippets）

## 模組說明

### 1) Tools（互動工具區）
提供即時可操作的小工具：
- JSON Formatter：JSON 格式化 / 壓縮 / 錯誤提示
- JS Snippet Runner：執行 JavaScript 並顯示 `console.log` 結果
- Regex Tester：測試正規表達式與高亮匹配內容
- API Tester（簡化版）：支援 GET / POST、Headers / Body、回應顯示
- dataLayer Simulator：模擬 `dataLayer.push` 並顯示 payload

### 2) Snippets（語法模板區）
提供程式碼片段管理：
- 新增 / 編輯 / 刪除
- 分類（JS / React / SQL / Cloud / Docker / Git / Tracking / API）
- Tag 與關鍵字搜尋
- 一鍵 Copy
- 本機儲存（localStorage）
- 分頁（可切換每頁 5 / 10 / 15 / 20）
- 點擊卡片放大檢視、點空白處收合
- 自訂刪除確認彈窗（非瀏覽器原生 alert/confirm）

## 首頁與導覽
- `index.html`：平台首頁（形象主視覺 + 兩大模組入口）
- `tools.html`：Tools 模組頁
- `snippets.html`：Snippets 模組頁

## 執行方式
本專案為純前端靜態頁面，無需安裝相依套件。

### 方式一：直接開啟
直接以瀏覽器開啟 `index.html`。

### 方式二：本機靜態伺服器（可選）
若你習慣用本機 server，可用任一靜態伺服器工具啟動後瀏覽。

## 資料儲存說明
- Snippets 與主題設定儲存在瀏覽器 `localStorage`
- 清除瀏覽器站點資料會一併清除本地 snippets
- 專案內建預設 snippets，首次載入或缺少時會自動補齊
- 舊版分類 `Docker/Git` 會自動遷移為 `Docker` 或 `Git`

## 主要檔案結構

```text
index.html        # 首頁
tools.html        # Tools 頁面
snippets.html     # Snippets 頁面
styles.css        # 共用樣式
common.js         # 主題切換等共用邏輯
tools.js          # Tools 互動邏輯
snippets.js       # Snippets CRUD / 分頁 / 放大檢視 / 刪除確認
READ.md           # 專案說明文件
```

## 介面與設計重點
- 繁體中文（台灣）介面
- 米白色系主題 + 深淺模式切換
- 模組分區清楚，桌機/行動裝置皆可用

## 未來可擴充方向
- Snippets 匯入 / 匯出（JSON）
- API Tester 請求歷史紀錄
- Snippets 雲端同步（登入後跨裝置）
- Regex / JSON 常用範例庫與一鍵套用
