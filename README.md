### 重要的點
## Docker
make sure you've opened "Docker Desktop" 反正就是docker這個軟體本人要開著啦
然後在你跑下面示範的docker指令之後，去docker app裡面看是不是8082 11435兩個port都在線 (應該顯示綠色看的出來)
另外可以看他docker上面跑的log來幫助debug
## Ollama
for the first time (I mean in a device), you need to download ollama model first. Follow the tutorial below
然後model你可以自己看要下載哪個 我是llama2 但3.7gb有點那麼兒大 如果要測試可以用llama2:7b (下面code示範的)
## Port 
目前是8082 11435，有被使用到的話你可以去docker-compose.yml改
## docs
你到時候應該會到localhost:8082的網址裡面看，如果想要看到我給你看的debug畫面，在網址後面加/docs (印象中是)，就會跑出來
多加利用他的Execute功能可以試驗一些杉樹會得到甚麼return

## 下面是我叫CLAUDE生的

# AI Web Chatbot

基於 FastAPI 和 Ollama 的智能聊天機器人，支持多個聊天會話和消息管理。此專案是用 Docker 容器化的，讓部署變得簡單快捷。

## 功能特點

- 與 AI 模型對話
- 管理多個聊天會話
- 查看和管理聊天歷史記錄
- 使用 Docker 容器化，易於部署

## 系統需求

- Docker 和 Docker Compose
- Windows、macOS 或 Linux 系統
- 至少 8GB RAM（推薦用於運行較大的語言模型）
- 至少 10GB 可用磁盤空間（用於 Docker 映像和 Ollama 模型）
- 穩定的互聯網連接（用於下載模型）

## 快速部署指南

### 步驟 1: 安裝 Docker Desktop

如果你還沒有安裝 Docker Desktop：

1. 前往 [Docker 官網](https://www.docker.com/products/docker-desktop/) 下載適合你操作系統的版本
2. 安裝並啟動 Docker Desktop
3. 確保 Docker Desktop 正在運行（Windows任務欄或 macOS 狀態欄上會有 Docker 圖標）

### 步驟 2: 獲取專案代碼

克隆或下載本專案到本地：

```bash
git clone [你的儲存庫地址]
cd [專案目錄]
```

或者直接下載並解壓專案文件。

### 步驟 3: 使用 Docker Compose 啟動服務

在專案根目錄中（包含 `docker-compose.yml` 的目錄），打開終端（Windows 用戶可以使用 CMD 或 PowerShell）並執行：

```bash
docker-compose up --build -d
```

這個命令會：

- 構建應用容器
- 拉取 Ollama 官方映像
- 創建存儲卷用於數據持久化
- 在後台啟動所有服務

> **注意**：首次運行可能需要幾分鐘，因為 Docker 需要下載基礎映像和構建容器。

### 步驟 4: 下載 Ollama 模型

當容器啟動後，你需要下載 AI 語言模型。在終端中運行：

```bash
docker exec -it ai_chatbot_ollama ollama pull llama2:7b
```

> **重要說明**：你不需要在本地安裝 Ollama 應用程序，所有 Ollama 相關的操作都是在 Docker 容器內進行的，只需要通過上述終端命令與容器交互即可。

> **提示**：如果你的系統資源充足，可以選擇下載功能更強大的模型：
>
> - `docker exec -it ai_chatbot_ollama ollama pull llama2` (更大更強大)
> - `docker exec -it ai_chatbot_ollama ollama pull mistral` (平衡大小與性能)
> - `docker exec -it ai_chatbot_ollama ollama pull orca-mini` (小型模型，適合資源有限的系統)

下載過程中會顯示進度，請耐心等待完成。根據你的網絡速度，下載可能需要幾分鐘到幾十分鐘不等。

### 步驟 5: 確認模型下載狀態

要確認模型是否成功下載，請運行以下命令：

```bash
docker exec -it ai_chatbot_ollama ollama list
```

這將顯示所有已下載的模型列表。你應該能看到類似下面的輸出：

```
NAME        SIZE    MODIFIED
llama2:7b   4.1GB   About a minute ago
```

如果你看到了模型名稱和大小，說明模型已成功下載並準備好使用。

### 步驟 6: 訪問應用

模型下載完成後，打開瀏覽器訪問：

```
http://localhost:8082
```

現在你可以開始使用 AI 聊天機器人了！

## 使用指南

### 創建聊天會話

1. 訪問應用首頁
2. 點擊「創建新會話」按鈕
3. 輸入會話標題（僅限英文字母和數字，3-30個字符）
4. 點擊「創建」

### 與 AI 聊天

1. 選擇一個已創建的會話
2. 在輸入框中輸入你的消息
3. 點擊「發送」或按 Enter 鍵
4. AI 會生成回應並顯示在聊天窗口中

### 管理會話

- 要查看所有會話，訪問主頁面
- 要重命名會話，點擊會話旁邊的「編輯」按鈕
- 要刪除會話，點擊會話旁邊的「刪除」按鈕

## 停止和重啟服務

### 停止服務

要停止所有容器但保留數據：

```bash
docker-compose stop
```

### 完全移除服務

要停止並移除所有容器和網絡（但保留數據卷）：

```bash
docker-compose down
```

### 重啟服務

要重啟服務：

```bash
docker-compose up -d
```

## 故障排除

### 查看容器日誌

如果應用無法正常工作，可以查看容器日誌：

```bash
# 查看應用容器日誌
docker logs ai_chatbot_app

# 查看 Ollama 容器日誌
docker logs ai_chatbot_ollama
```

### 常見問題

1. **端口衝突**

   如果 8082 或 11435 端口已被佔用，修改 `docker-compose.yml` 文件中的端口映射。

2. **內存不足**

   如果遇到 Ollama 啟動失敗或模型加載失敗，可能是因為內存不足。嘗試增加 Docker 的內存分配或使用更小的模型。

3. **模型下載失敗**

   如果模型下載中斷，再次運行下載命令即可從上次中斷的位置繼續。

4. **應用無法連接到 Ollama**

   確保兩個容器都在運行，並且 `OLLAMA_URL` 環境變數設置正確。

5. **確認 Ollama 是否正常運行**

   如果懷疑 Ollama 服務有問題，可以運行以下命令來檢查：

   ```bash
   docker exec -it ai_chatbot_ollama ollama --version
   ```

   或者嘗試在 Ollama 容器中直接與模型對話來測試：

   ```bash
   docker exec -it ai_chatbot_ollama ollama run llama2:7b
   ```

   輸入一些文字後，如果模型能夠回應，說明 Ollama 正常工作。完成測試後輸入 `/bye` 退出。

## 高級配置

### 更改 Ollama 模型

要切換到不同的模型，下載該模型後，在發送消息時指定模型名稱：

```
POST /chat
{
  "model": "另一個模型名稱",
  "messages": [...]
}
```

### 自定義 Docker 配置

你可以根據需要修改 `docker-compose.yml` 文件來調整配置，例如更改端口映射、環境變數或卷配置。

## 開發信息

- 後端框架: FastAPI
- 數據庫: SQLite
- AI 模型服務: Ollama
- 容器化: Docker & Docker Compose

## 許可證

[在此添加你的許可證信息]
