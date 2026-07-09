# 🍜 就決定是你了 - 美食推薦 App

> 解決三餐選擇困難症，一鍵決定吃什麼！

AI 美食推薦 + 街景隱藏店家挖掘，手機版 Web App（響應式設計）。

![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black)
![React](https://img.shields.io/badge/React-19.2.7-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

---

## ✨ 核心功能

### 🎯 個人喜好篩選器
- 預算範圍（<$100 / $100-300 / >$300）
- 料理類型（中式、日式、韓式、美式、義式、在地小吃、異國料理）
- 距離範圍（500m、1km、5km）
- 特殊需求（適合家庭、可外帶、有停車位）

### 🔴 一鍵決定按鈕
精靈球造型按鈕，根據篩選條件隨機推薦一家餐廳，點擊後旋轉動畫 → 彈出推薦卡片。

### 🗺️ 雙層地圖
- 圖層 A：Google Maps 標準店家（藍色）
- 圖層 B：AI 街景偵測隱藏店家（金黃色神秘標示）

### 📋 推薦卡片
店家名稱、評分、距離、料理類型、價格區間、Google Maps 連結、「再轉一次」按鈕。

---

## 🚀 快速開始

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建構生產版本
npm run build

# 啟動生產伺服器
npm start
```

環境變數（詳見 `.env.example`）：
- `GOOGLE_MAPS_API_KEY` - Google Maps / Places API 金鑰
- `GEMINI_API_KEY` - Gemini API 金鑰（Phase 2 街景AI用）

---

## 📁 專案架構

```
src/
├── app/
│   ├── page.tsx          # 主頁面
│   ├── layout.tsx        # 根佈局
│   ├── globals.css       # 全域樣式（Tailwind）
│   └── api/
│       └── restaurants/
│           └── route.ts  # 餐廳推薦 API
public/
└── ...                   # 靜態資源
```

---

## 🗺️ 地圖功能（Phase 1）

目前支援 Google Maps 串接與隨機推薦。街景 AI 偵測屬於 Phase 2 規劃中。

---

## 📈 發展藍圖

| 階段 | 內容 |
|------|------|
| Phase 0 | MVP 網頁版（不含街景AI） |
| Phase 1 | 地圖 + 推薦系統上線 ✅ |
| Phase 2 | 街景AI偵測（OCR + Gemini） |
| Phase 3 | AdMob 串接 |
| Phase 4 | 商家自助投放後台 |

---

## 🔧 技術棧

- **Framework**：Next.js 16.2.10（App Router）
- **Styling**：Tailwind CSS 4
- **餐廳資料**：SerpApi（Google Maps 整合）
- **部署**：Vercel

---

## 📄 授權

MIT License

*最後更新：2026-07-07*
