#!/bin/bash
# reset-and-pull.sh

# Kill all processes matching "next"
echo "Stopping any running Next.js processes..."
pkill -f "next"

# Remove project build and dependency artifacts
echo "Removing node_modules/..."
rm -rf node_modules/

echo "Removing .next/ build directory..."
rm -rf .next/

echo "Removing package-lock.json..."
rm -f package-lock.json

echo "Removing package.json..."
rm -f package.json

# Pull latest changes from Git
echo "Pulling latest code from Git repository..."
git pull

echo "✅ Project reset complete."