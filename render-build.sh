#!/usr/bin/env bash
# Build script for Render
npm install
cd backend
npm install
npx puppeteer browsers install chrome
cd ../frontend
npm install
npm run build
