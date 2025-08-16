#!/bin/bash
set -e

echo "📦 Bundling UnoCSS for Motor..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build bundles
echo "🔨 Building bundles..."
npm run build

# Copy bundles to parent modules directory
echo "📋 Copying bundles..."
mkdir -p ../modules
cp modules/unocss-core.bundle.js ../modules/
cp modules/preset-tailwind.bundle.js ../modules/

echo "✅ UnoCSS bundled successfully!"
echo ""
echo "Generated bundles:"
echo "  - modules/unocss-core.bundle.js"
echo "  - modules/preset-tailwind.bundle.js"