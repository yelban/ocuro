# Ocuro 程式碼架構說明文件

## 1. 架構概述

Ocuro 採用現代化的前端架構，基於 Next.js 框架構建，使用 React 作為 UI 層，配合 Three.js 實現 3D 渲染功能。整體架構遵循關注點分離原則，將業務邏輯、UI 元件、狀態管理等模組化組織。

### 1.1 技術架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                        使用者介面層                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │   Hooks     │         │
│  │  (路由)     │  │  (UI元件)   │  │  (邏輯封裝) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                        業務邏輯層                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Features   │  │   Stores    │  │   Utils     │         │
│  │  (核心功能) │  │  (狀態管理) │  │  (工具函數) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                        服務整合層                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  AI APIs    │  │  TTS APIs   │  │  WebSocket  │         │
│  │ (AI服務整合)│  │ (語音合成)  │  │  (即時通訊) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                        基礎設施層                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Next.js    │  │  Three.js   │  │    i18n     │         │
│  │  (框架)     │  │  (3D引擎)   │  │   (國際化)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 2. 目錄結構詳解

### 2.1 根目錄結構
```
ocuro/
├── src/                    # 原始碼目錄
├── public/                 # 靜態資源
├── locales/               # 國際化檔案
├── .specstory/            # 專案設定
├── package.json           # 專案依賴
├── tsconfig.json          # TypeScript 設定
├── next.config.mjs        # Next.js 設定
├── tailwind.config.ts     # Tailwind CSS 設定
└── README.md              # 專案說明
```

### 2.2 src 目錄結構

#### 2.2.1 components/ - UI 元件
```
components/
├── settings/              # 設定相關元件
│   ├── apiKeys.tsx       # API 金鑰設定
│   ├── characterVoice.tsx # 角色語音設定
│   ├── chatLog.tsx       # 對話記錄
│   └── ...
├── messageInputContainer.tsx  # 訊息輸入容器
├── meta.tsx              # Meta 標籤元件
├── menu.tsx              # 主選單
└── ...
```

**設計原則**：
- 每個元件負責單一功能
- 使用 TypeScript 確保類型安全
- 遵循 React 最佳實踐（函數式元件、Hooks）

#### 2.2.2 features/ - 核心功能模組

```
features/
├── chat/                  # AI 對話功能
│   ├── aiChatFactory.ts  # AI 服務工廠模式
│   ├── openAiChat.ts     # OpenAI 整合
│   ├── anthropicChat.ts  # Anthropic 整合
│   └── ...
├── messages/              # 訊息和語音處理
│   ├── messages.ts       # 訊息處理邏輯
│   ├── speakCharacter.ts # 角色語音播放
│   └── synthesizers/     # 各種 TTS 引擎
├── vrmViewer/            # VRM 3D 檢視器
│   ├── viewer.tsx        # 主檢視器元件
│   ├── model.ts          # VRM 模型載入
│   └── viewerContext.tsx # 檢視器上下文
├── emoteController/      # 表情控制器
│   └── autoLookAt.ts     # 自動視線追蹤
└── stores/               # Zustand 狀態管理
    ├── home.ts           # 首頁狀態
    ├── settings.ts       # 設定狀態
    └── ...
```

### 2.3 核心模組詳解

#### 2.3.1 AI 對話模組 (chat/)

**架構設計**：
- **工廠模式**：`aiChatFactory.ts` 根據選擇的 AI 服務動態創建對應的聊天實例
- **統一介面**：所有 AI 服務實現相同的介面，確保可替換性
- **串流支援**：支援 SSE (Server-Sent Events) 實現即時回應

```typescript
// AI 服務介面定義
interface AIService {
  chat(messages: Message[]): Promise<Response>
  streamChat(messages: Message[]): AsyncGenerator<string>
}
```

**支援的 AI 服務**：
- OpenAI (GPT-3.5/4)
- Anthropic (Claude)
- Google (Gemini)
- 本地 LLM (透過 API)
- Dify 平台
- 其他（Groq、Cohere、Mistral 等）

#### 2.3.2 VRM 檢視器模組 (vrmViewer/)

**核心功能**：
- VRM 模型載入和管理
- Three.js 場景設定
- 相機控制
- 動畫播放
- 表情控制

**關鍵檔案**：
- `viewer.tsx`：主要的 React 元件，管理 3D 場景
- `model.ts`：VRM 模型載入邏輯
- `viewerContext.tsx`：提供全域存取 VRM 檢視器的 Context

#### 2.3.3 語音合成模組 (messages/)

**架構特點**：
- **策略模式**：不同的 TTS 引擎實現相同介面
- **佇列管理**：確保語音按順序播放
- **唇形同步**：與 VRM 模型動畫配合

```typescript
// TTS 引擎介面
interface TTSEngine {
  synthesize(text: string, voice: VoiceConfig): Promise<AudioBuffer>
}
```

**支援的 TTS 引擎**：
- Google TTS
- Azure 語音服務
- ElevenLabs
- OpenAI TTS
- StyleBertVITS2

#### 2.3.4 狀態管理 (stores/)

使用 Zustand 進行狀態管理，主要 Store：

- **homeStore**：管理首頁狀態（角色、背景、AI 服務選擇等）
- **settingsStore**：管理應用設定（API 金鑰、語音設定等）
- **menuStore**：管理 UI 選單狀態
- **notificationStore**：管理通知訊息

**設計原則**：
- 狀態持久化（使用 localStorage）
- 原子化更新
- TypeScript 類型安全

### 2.4 API 路由 (pages/api/)

```
pages/api/
├── anthropic.ts          # Anthropic API 代理
├── cohere.ts            # Cohere API 代理
├── openai.ts            # OpenAI API 代理
└── ...
```

**功能**：
- 作為前端和 AI 服務之間的代理
- 處理 CORS 問題
- 統一錯誤處理
- API 金鑰管理（伺服器端）

## 3. 關鍵設計模式

### 3.1 工廠模式
用於 AI 服務和 TTS 引擎的動態創建：
```typescript
export function getAIChatService(service: string): AIService {
  switch(service) {
    case 'openai': return new OpenAIChat()
    case 'anthropic': return new AnthropicChat()
    // ...
  }
}
```

### 3.2 策略模式
不同的 AI 服務和 TTS 引擎實現相同介面，可互換使用。

### 3.3 觀察者模式
使用 React Context 和 Zustand 實現元件間的狀態同步。

### 3.4 單例模式
VRM 檢視器實例在應用中保持唯一。

## 4. 資料流程

### 4.1 對話流程
```
使用者輸入 → MessageInput → Chat Service → AI API
    ↓                                         ↓
顯示回應 ← Message Component ← Store ← API Response
    ↓
TTS 合成 → Audio 播放 → VRM 唇形同步
```

### 4.2 VRM 載入流程
```
選擇 VRM → 載入檔案 → 解析 VRM → 創建 Three.js 物件
    ↓                               ↓
更新 Store ← 綁定動畫 ← 設定材質 ← 加入場景
```

## 5. 效能優化策略

### 5.1 程式碼分割
- 使用 Next.js 的動態匯入減少初始載入大小
- 按需載入 AI 服務模組

### 5.2 資源優化
- 字體子集化（僅包含使用的字符）
- 圖片懶載入
- VRM 模型快取

### 5.3 渲染優化
- React.memo 防止不必要的重渲染
- Three.js 場景優化（LOD、視錐剔除）
- 使用 Web Workers 處理繁重計算

## 6. 安全考量

### 6.1 API 金鑰管理
- 客戶端金鑰加密儲存
- 支援伺服器端代理模式
- 環境變數配置

### 6.2 輸入驗證
- 使用者輸入消毒
- API 參數驗證
- 檔案上傳限制

### 6.3 內容安全
- CSP (Content Security Policy) 設定
- XSS 防護
- CORS 配置

## 7. 擴展性設計

### 7.1 插件化架構
- AI 服務和 TTS 引擎易於新增
- 統一的介面定義
- 模組化的程式碼組織

### 7.2 國際化支援
- 使用 i18next 實現多語言
- 語言檔案分離
- 動態語言切換

### 7.3 主題客製化
- Tailwind CSS 配置
- CSS 變數支援
- 元件樣式隔離

## 8. 開發工具鏈

### 8.1 建置工具
- **Next.js**：提供開箱即用的建置配置
- **TypeScript**：類型檢查和 IntelliSense
- **SWC**：快速的 JavaScript/TypeScript 編譯

### 8.2 程式碼品質
- **ESLint**：程式碼規範檢查
- **Prettier**：程式碼格式化
- **Husky**：Git hooks（如有配置）

### 8.3 開發體驗
- **熱模組替換**：即時預覽修改
- **錯誤覆蓋**：清晰的錯誤提示
- **TypeScript 嚴格模式**：提早發現潛在問題

## 9. 部署架構

### 9.1 靜態部署
```bash
npm run build
npm run export
# 產出靜態檔案可部署到任何靜態託管服務
```

### 9.2 伺服器部署
```bash
npm run build
npm start
# 運行 Next.js 伺服器
```

## 10. 監控和除錯

### 10.1 錯誤處理
- 全域錯誤邊界
- API 錯誤統一處理
- 使用者友好的錯誤訊息

### 10.2 日誌記錄
- 開發環境詳細日誌
- 生產環境錯誤追蹤
- 效能監控點

### 10.3 除錯工具
- React Developer Tools
- Redux DevTools (for Zustand)
- Three.js Inspector

## 11. 最佳實踐

### 11.1 程式碼組織
- 功能導向的目錄結構
- 明確的命名規範
- 適當的抽象層級

### 11.2 狀態管理
- 最小化全域狀態
- 就近管理元件狀態
- 避免狀態重複

### 11.3 效能考量
- 避免過度渲染
- 合理使用 useMemo/useCallback
- 非同步載入大型依賴

## 12. 未來架構演進

### 12.1 微前端化
- 將大型功能模組獨立部署
- 動態載入功能模組
- 獨立的開發和部署週期

### 12.2 插件系統
- 定義標準插件介面
- 插件市場
- 沙盒執行環境

### 12.3 後端服務化
- 將 API 代理獨立為後端服務
- 加入使用者系統
- 資料持久化層

## 結語

Ocuro 的架構設計注重模組化、可擴展性和使用者體驗。透過清晰的分層架構和設計模式，確保程式碼的可維護性和可擴展性。隨著專案的發展，架構將持續演進以滿足新的需求和挑戰。