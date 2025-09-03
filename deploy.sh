#!/bin/bash

# Deployment helper script for Idavang Next.js project

echo "🚀 Idavang Deployment Helper"
echo "=========================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from your project root."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Commit them first:"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to commit all changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        echo "✅ Changes committed"
    else
        echo "❌ Please commit your changes before deploying"
        exit 1
    fi
fi

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo "❌ No 'origin' remote found."
    echo "Please add your GitHub repository as origin:"
    echo ""
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Click 'New Project' and import your GitHub repository"
    echo "3. After deployment, add Vercel Postgres database"
    echo "4. Your app will be live!"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
