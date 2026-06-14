#!/bin/bash
# ============================================
# 「就決定是你了」部署腳本 - 適用 macOS / Linux / WSL
# ============================================

set -e

echo "========================================"
echo "就決定是你了 - 一鍵部署到 GitHub + Vercel"
echo "========================================"

# 檢查是否在正確目錄
if [ ! -f "package.json" ]; then
    echo "❌ 請確保在 app-food-picker 資料夾內執行此腳本"
    exit 1
fi

# 檢查 git
if ! command -v git &> /dev/null; then
    echo "❌ 需要先安裝 Git"
    exit 1
fi

# 1. 初始化 Git（如果還沒初始過）
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git..."
    git init
    git config user.email "app@food-picker.local"
    git config user.name "Food Picker"
fi

# 2. 加入所有檔案
echo "📁 加入檔案..."
git add .

# 3. 檢查更動
echo "📋 目前的更動："
git status

echo ""
echo "========================================"
echo "即將執行 Git Push 到 GitHub"
echo "請確保你已經在 GitHub 建立一個空的 repo："
echo "  → 登入 github.com"
echo "  → 點 New Repository"
echo "  → 命名為 app-food-picker"
echo "  → 不要勾選任何選項（保持空白）"
echo "========================================"
echo ""

# 優先使用環境變數，否則互動式詢問
if [ -z "$GITHUB_URL" ]; then
    read -p "請貼上你的 GitHub repo URL（例如：https://github.com/你的帳號/app-food-picker.git）：" GITHUB_URL
fi

# 設定 remote 並推送
echo "🚀 推送程式碼到 GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin "$GITHUB_URL"
git branch -M main

# 嘗試推送（如果失敗可能是還沒建立 repo）
echo ""
echo "嘗試推送中..."
if git push -u origin main; then
    echo ""
    echo "========================================"
    echo "✅ 成功推送到 GitHub！"
    echo ""
    echo "下一步："
    echo "  1. 開啟 https://vercel.com"
    echo "  2. Add New → Project"
    echo "  3. Import 你的 app-food-picker repo"
    echo "  4. 點 Deploy 完成！"
    echo ""
    echo "部署完成後告訴我 URL，我幫你驗證！"
    echo "========================================"
else
    echo ""
    echo "❌ 推送失敗，可能是："
    echo "  1. GitHub repo 還沒建立"
    echo "  2. 需要先在 GitHub 建立 repo"
    echo "  3. GitHub 登入驗證問題"
    echo ""
    echo "請先到 https://github.com/new 建立一個空的 repo"
    echo "命名為：app-food-picker"
    echo "然後再執行一次這個腳本"
fi