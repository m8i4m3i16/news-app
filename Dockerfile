# ---- Stage 1: Build Vue frontend ----
    FROM node:18-alpine AS build-stage
    # 'node:18-alpine' 是一個包含 Node.js 18 的輕量級 Linux (Alpine) 鏡像
    
    WORKDIR /app/frontend
    # 在容器內創建 /app/frontend 工作目錄
    
    COPY frontend/package.json frontend/package-lock.json ./
    # 只複製 package.json 和 package-lock.json，以便利用 Docker 的層緩存
    # 如果這些文件沒有變化，下面的 npm install 就不會重新執行
    
    RUN npm install
    # 安裝前端依賴
    
    COPY frontend/ ./
    # 複製前端所有源代碼到容器的 /app/frontend 目錄
    
    RUN npm run build
    # 執行前端構建命令，生成靜態文件到 frontend/dist/
    
    # ---- Stage 2: Setup Node.js backend server ----
    FROM node:18-alpine
    # 再次使用輕量級 Node.js 鏡像作為運行時環境
    
    WORKDIR /app
    # 在容器內創建 /app 工作目錄 (這是最終應用運行的根目錄)
    
    # 從 build-stage (第一階段) 複製構建好的前端靜態文件到後端的 public 或 dist 目錄
    # 我們假設後端 Express 會從 ./public 提供靜態文件
    COPY --from=build-stage /app/frontend/dist ./public
    # 如果你的 Vue build 輸出目錄不是 'dist'，或者你想放到其他名字的目錄，請相應修改
    
    # 複製後端 package.json 和 package-lock.json
    COPY backend/package.json backend/package-lock.json ./backend/
    WORKDIR /app/backend
    # 進入後端目錄安裝依賴
    RUN npm install --omit=dev
    # 只安裝生產環境依賴，忽略 devDependencies
    
    # 複製後端所有源代碼
    # 注意：要確保只複製必要的，例如 server.js, nodemon.json (如果Cloud Run用nodemon，但通常不用)
    # 如果有 .env 檔案，不應該複製到鏡像中，應通過環境變數配置
    COPY backend/server.js ./
    COPY backend/nodemon.json ./ 
    # 如果 server.js 依賴它 (但Cloud Run通常直接跑node server.js)
    # 如果還有其他後端需要的檔案 (例如路由文件夾)，也需要複製
    # COPY backend/routes ./routes
    
    # 回到應用根目錄
    WORKDIR /app
    
    # 設置環境變數 (可選，如果你的 server.js 依賴它們)
    # ENV NODE_ENV=production
    # ENV PORT=8080 # Cloud Run 會自動注入 PORT 環境變數
    
    EXPOSE 8080
    # 聲明容器將在 8080 端口上監聽 (這需要和你的 server.js 中的 PORT 一致)
    # Cloud Run 期望應用監聽 process.env.PORT，預設是 8080
    
    # 啟動後端伺服器的命令
    # Cloud Run 通常會忽略 CMD，它有自己的啟動方式，但 Dockerfile 中最好還是提供一個
    # 確保 server.js 在 /app/backend/ 目錄下
    CMD [ "node", "backend/server.js" ]