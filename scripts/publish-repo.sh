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
git commit -m "feat: link vercel to live render backend at slow-sunday-boutique.onrender.com" || echo "Nothing new to commit."

echo "🚀 Pushing changes to GitHub..."
git push origin main || git push -u origin main

echo ""
echo "🎉 Done! Your repository is updated at:"
echo "👉 https://github.com/RichardCraven/slow-sunday-boutique"
echo "=================================================="
