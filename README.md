# Ocuro

<p align="center">
  <strong>智能 VRM 角色對話系統</strong>
</p>

## 概覽

Ocuro 是一個基於 VRM 的智能角色對話系統，支援多種 AI 語言模型和語音合成技術。用戶可以與 3D 虛擬角色進行自然對話，並可自訂角色外觀、聲音和個性。

## 主要功能

### 🎭 AI 角色對話
- 支援多種 AI 服務（OpenAI、Anthropic、Google Gemini、Groq、Azure OpenAI 等）
- 可自訂角色個性和系統提示
- 支援語音輸入和文字輸入
- 多模態功能，支援圖像識別和分析

### 🎙️ 語音合成
- 多種語音引擎選擇（Google TTS、Azure TTS、ElevenLabs、OpenAI TTS 等）
- 支援多語言語音合成
- 可調整語速、音調等參數

### 👤 VRM 角色系統
- 支援 VRM 格式的 3D 角色模型
- 表情和動作控制
- 自動眨眼和視線跟蹤
- 可自訂背景圖片

### 🌐 多語言支援
- 完整的 i18n 國際化支援

## 開發環境

- Node.js: ^20.0.0
- Next.js: 14.2.x
- React: 18.3.x
- TypeScript: 5.0.x

## 快速開始

### 1. 克隆專案

```bash
git clone https://github.com/yelban/ocuro.git
cd ocuro
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 啟動開發服務器

```bash
npm run dev
```

### 4. 開啟瀏覽器

訪問 [http://localhost:3000](http://localhost:3000) 開始使用。

## 配置說明

### AI 服務配置

在設定頁面中配置所需的 AI 服務 API 金鑰：

- **OpenAI**: 需要 OpenAI API 金鑰
- **Anthropic**: 需要 Anthropic API 金鑰
- **Google Gemini**: 需要 Google API 金鑰
- **Azure OpenAI**: 需要 Azure API 金鑰和端點
- **Groq**: 需要 Groq API 金鑰

### 語音合成配置

1. **Google TTS**: 需要 Google Cloud 服務帳戶憑證
2. **Azure TTS**: 需要 Azure 語音服務金鑰
3. **ElevenLabs**: 需要 ElevenLabs API 金鑰
4. **OpenAI TTS**: 需要 OpenAI API 金鑰

### 角色自訂

1. **VRM 模型**: 在設定中上傳 VRM 檔案，或替換 `public/2413980852884241452.vrm`
2. **背景圖片**: 上傳背景圖片，或替換 `public/bg-c-0619.png`
3. **角色設定**: 自訂系統提示來調整角色個性

## 專案結構

```
ocuro/
├── src/
│   ├── components/          # React 元件
│   ├── features/           # 功能模組
│   │   ├── chat/           # 聊天相關
│   │   ├── messages/       # 訊息處理
│   │   ├── stores/         # 狀態管理
│   │   └── vrmViewer/      # VRM 檢視器
│   ├── pages/              # Next.js 頁面
│   └── styles/             # 樣式檔案
└── public/                 # 靜態資源
```

## 環境變數

可以在 `.env` 檔案中設定以下環境變數：

```env
NEXT_PUBLIC_SELECT_AI_SERVICE=openai
NEXT_PUBLIC_SELECT_AI_MODEL=gpt-4
NEXT_PUBLIC_SELECT_VOICE=google
NEXT_PUBLIC_SHOW_ASSISTANT_TEXT=true
NEXT_PUBLIC_SHOW_CONTROL_PANEL=true
```

## 可用腳本

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產服務器
npm run start

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format
```

## 技術棧

- **前端框架**: Next.js 14
- **UI 框架**: React 18
- **程式語言**: TypeScript
- **狀態管理**: Zustand
- **樣式**: Tailwind CSS
- **3D 引擎**: Three.js
- **VRM 支援**: @pixiv/three-vrm
- **AI 整合**: AI SDK
- **語音合成**: 多種 TTS 服務
- **國際化**: i18next

## 許可證

本專案採用 MIT 許可證。詳見 [LICENSE](./LICENSE) 檔案。

## 致謝

本專案基於 [pixiv/ChatVRM](https://github.com/pixiv/ChatVRM) 開發，感謝原作者的貢獻。

## 貢獻

歡迎提交 Issue 和 Pull Request 來改進本專案。

---

© 2024 Ocuro. All rights reserved.