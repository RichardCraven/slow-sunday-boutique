#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

echo "=================================================="
echo " Publishing Slow Sunday Boutique to GitHub"
echo "=================================================="

echo "📦 Staging changes..."
git add .

echo "💾 Committing updates..."
git commit -m "feat: configure port 3333 and offline catalog fallback" || echo "Nothing new to commit."

echo "🚀 Creating GitHub repository 'slow-sunday-boutique' and pushing..."
gh repo create slow-sunday-boutique --public --source=. --remote=origin --push

echo ""
echo "🎉 Done! Your repository is live at:"
echo "👉 https://github.com/RichardCraven/slow-sunday-boutique"
echo "=================================================="
