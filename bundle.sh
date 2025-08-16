#!/bin/bash

echo "🎨 Building UnoCSS Core for Motor..."

# Clean previous builds
rm -rf modules/

# Install dependencies
npm install

# Bundle with Rollup
npm run build

# Check if build succeeded
if [ -f "modules/unocss-core.bundle.js" ]; then
    echo "✅ UnoCSS Core bundled successfully!"
    
    # Show bundle size
    size=$(du -h modules/unocss-core.bundle.js | cut -f1)
    echo "📦 Bundle size: $size"
else
    echo "❌ Build failed!"
    exit 1
fi