#!/usr/bin/env bash
cd "$(dirname "$0")"
echo ""
echo "  Installing dependencies (first run only)..."
npm install --silent 2>/dev/null
echo ""
echo "  Starting StreamElements Chat Bridge..."
echo "  Keep this terminal open while you stream."
echo "  Press Ctrl+C to stop."
echo ""
node bridge.js
