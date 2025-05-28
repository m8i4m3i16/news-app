本專案旨在開發一個網頁應用程式，串接「臺北市水利處雨量站即時資料」OpenAPI，提供即時的雨量資訊展示、內容關鍵字搜尋、可調整的字級大小（並記憶用戶偏好）以及響應式網頁設計，確保在桌面和手機設備上均有良好體驗。應用程式已通過 Docker 容器化，並成功部署於 Google Cloud Platform (GCP) Cloud Run。

**(Live Demo):** [https://news-app-service-220352250803.asia-east1.run.app](https://news-app-service-220352250803.asia-east1.run.app)

---
##(Features)

*   **即時雨量資料展示：** 以表格形式清晰展示從臺北市水利處獲取的各觀測站的即時雨量、記錄時間等信息。
*   **內容關鍵字搜尋：** 支持用戶按「測站編號」或「測站名稱」進行快速內容篩選，即時更新表格數據。
*   **字級大小調整與記憶：**
    *   提供界面按鈕允許用戶放大或縮小網頁的整體字級。
    *   用戶調整後的字級大小會通過 localStorage 進行本地存儲，關閉網頁後下次開啟仍能記憶並應用上次的設定。
*   **響應式網頁設計 (RWD)：** 網頁佈局能夠自動適應不同尺寸的設備屏幕，包括桌面電腦、平板和手機，確保良好的用戶閱讀和操作體驗。
*   **後端 API 代理：** Node.js/Express 後端作為代理，負責從外部 OpenAPI 獲取數據，前端僅與此代理 API 通信。
*   **容器化部署：** 整個應用程式（前端構建產物和後端服務）被打包到一個 Docker 容器中。
*   **雲端部署：** 應用程式已部署到 GCP Cloud Run 服務，並可通過公開 URL 訪問。
*   **CSRF 保護基礎：** 後端為假設的 POST 請求配置了 CSRF token 保護機制。

---

##(Tech Stack)

*    (Frontend) 
     *   Vue 3 (Composition API)
     *   TypeScript
     *   Vite 
     *   Axios 
     *   Naive UI 
     *   Vue Router 
*    (Backend) 
     *   Node.js
     *   Express.js
     *   Axios 
     *   cookie-parser, express-session, csurf 
*    (Version Control) 
     *  Git
     *  GitHub
*    (Containerization) 
       Docker 
*    (Cloud & Deployment) 
       *   Google Cloud Platform (GCP)
        *   Artifact Registry
        *   Cloud Run
        *   Cloud Build
