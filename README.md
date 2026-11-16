# Hi-Fi Match｜音響設備搭配顧問

一個以原生 HTML、CSS、JavaScript 建立的響應式音響設備顧問網站，可部署於 GitHub Pages。

## 功能
- 首頁與精品 Hi-Fi 型錄風格介面
- 設備資料庫：搜尋、類別篩選、原廠資料連結
- 設備比較：兩項產品規格並列，未知資料標示「未提供」
- 搭配推薦：總預算、分項預算、房間尺寸、聲音偏好、訊源類型，產生三種搭配方向
- 音響知識：頻率響應、靈敏度、阻抗、擴大機功率
- 手機與桌面響應式版面

## 專案結構
```text
hi-fi-match/
├── index.html
├── styles.css
├── app.js
├── AGENTS.md
├── README.md
├── data/
│   └── products.json
└── tests/
    ├── test-data.js
    └── AI_EXTENSION_TEST.md
```

## 本機預覽
請在專案根目錄啟動靜態伺服器（不要直接用 `file://` 開啟，因為瀏覽器會限制 fetch JSON）。

Python：
```bash
python -m http.server 8000
```
接著開啟 `http://localhost:8000`。

## GitHub Pages 部署
1. 登入 GitHub，建立新的 Repository，例如 `hi-fi-match`。
2. 將本專案內所有檔案與資料夾上傳至 Repository 根目錄。
3. 進入 Repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. Branch 選 `main`，資料夾選 `/ (root)`，按 Save。
6. 等待 GitHub Pages 完成部署；公開網址通常為 `https://你的帳號.github.io/hi-fi-match/`。
7. 開啟網址，檢查設備資料庫是否載入、搜尋、比較與推薦是否正常。

> GitHub Pages 網址由 GitHub 帳號與 Repository 名稱決定，請以 Pages 設定頁實際顯示網址為準。

## 新增產品
1. 閱讀 `AGENTS.md` 第 5、8、9 節。
2. 在 `data/products.json` 加入一筆物件，遵守既有欄位與唯一 ID。
3. 只填有來源支持的規格；未知欄位使用 `null`。
4. 加入官方來源 URL 與查證狀態。
5. 重新載入網站，檢查搜尋、類別篩選、比較選單及推薦功能。
6. 執行 `node tests/test-data.js`（若電腦已安裝 Node.js）檢查 JSON 與資料結構。

## 資料來源原則
- DALI SONIK 1：DALI 官方產品頁。
- Wharfedale Diamond 12.1：Wharfedale 官方產品頁。
- 其他器材若尚未取得可核對文件，保留缺值並標示待查證。
- 售價會因地區、通路、活動與日期改變；沒有可靠的台灣報價就不顯示價格。
- What Hi-Fi 等評論可用於補充聆聽觀點，不應取代原廠規格。

## 目前限制
- 本專案不含後端資料庫，資料以 JSON 靜態檔案管理。
- 推薦為初步選購輔助；由於資料庫價格與擴大機輸出資料尚不完整，目前不會假裝能計算完整套裝總價或完成所有電氣相容性驗證。
- 產品示意圖為 CSS 繪製，不是實際商品照片。
- 需要自行建立 GitHub Repository 並啟用 Pages；本交付不會代替使用者登入或操作 GitHub 帳號。

## AI 開發規範
所有 AI 修改前必須先讀取 `AGENTS.md`。任何新增功能均需維持原生技術堆疊、既有視覺系統、資料格式與 GitHub Pages 相容性。
