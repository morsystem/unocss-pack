# Motor UnoCSS Pack

The instant atomic CSS engine for Motor applications. Generate CSS at build-time using Motor's event-sourcing architecture, powered by [UnoCSS](https://unocss.dev/).

## Overview

This pack provides the core UnoCSS engine for Motor, enabling:
- ⚡️ **Build-time CSS generation** - CSS generated when modules change
- 🎨 **Dynamic preset system** - Mix and match CSS frameworks
- 🔧 **Custom configurations** - Create your own CSS recipes
- 💾 **Event-sourced** - CSS stored as records in the event stream
- 🚀 **Zero runtime overhead** - Pre-generated CSS serves instantly

## Installation

```bash
# Install the UnoCSS core
motor pack add -f packs/unocss

# Install a preset (e.g., Tailwind)
motor pack add -f packs/unocss-tailwind
```

## Architecture

### How It Works

1. **Preset Registration**: CSS frameworks register themselves as Motor records
2. **Module Changes**: When you add/update modules with CSS classes
3. **CSS Regeneration**: Run `motor action run regenerate-css` to scan and generate
4. **Event Storage**: Generated CSS stored as `css-generated` event records
5. **Instant Serving**: Router serves pre-generated CSS from latest event

### Record Types

- `uno-preset`: Registered CSS presets (Tailwind, Bootstrap, etc.)
- `uno-config`: Custom configurations combining presets
- `css-generated`: Generated CSS stored as events

## Basic Usage

### Using a Single Preset

After installing a preset pack (e.g., `unocss-tailwind`):

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Loads Tailwind CSS -->
  <link rel="stylesheet" href="/tailwind.css">
</head>
<body>
  <div class="p-4 bg-blue-500 text-white">
    Hello Motor + UnoCSS!
  </div>
</body>
</html>
```

### Regenerating CSS

CSS is generated at build-time, not runtime. You need to regenerate CSS when:

1. **After adding new modules** with CSS classes
2. **After updating existing modules** with new classes
3. **After installing new preset packs**

```bash
# Regenerate CSS for Tailwind configuration
motor action run regenerate-css

# Or with custom options
motor action run regenerate-css -a '{"configName": "tailwind", "minify": false}'
```

**Note**: When installing packs that use UnoCSS (like counter-app), CSS is regenerated automatically.

### Using Theme Modules

You can define custom themes as Motor modules and use them during CSS generation. There are two ways to add a theme module:

#### Method 1: Using the CLI (Recommended for development)

First, create your theme configuration file:

```bash
# 1. Create the theme file in your project
mkdir -p app/modules
cat > app/modules/theme-config.ts << 'EOF'
export const theme = {
  colors: {
    primary: {
      DEFAULT: '#1a5490',
      dark: '#134069',
      light: '#2a74b0'
    }
  }
};
export default theme;
EOF

# 2. Add the theme module to Motor's database
motor module add -n "theme-config" -f "app/modules/theme-config.ts" -d "Custom UnoCSS theme configuration"

# 3. Verify it was added
motor module show theme-config

# 4. Or create it inline for quick testing
motor module add -n "theme-config" -i "export const theme = { colors: { primary: '#1a5490' } }" -d "Simple theme"
```

**Important**: The module is stored in Motor's database (db/motor.db), not the file system. Once added, you can delete the original file - Motor has its own copy.

#### Method 2: Including in Pack Manifest (Recommended for distribution)

When creating a Motor pack that will be shared or reused, always include the theme module in your `manifest.json`. This is the recommended approach for production applications:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "packs": ["unocss-wind4"]  // Ensure UnoCSS is available
  },
  "records": [
    {
      "type": "module",
      "name": "theme-config",
      "file": "app/modules/theme-config.ts",
      "description": "Custom UnoCSS theme configuration"
    },
    // ... other records (components, actions, etc.)
    {
      "type": "action/run",
      "name": "auto-regenerate-css",
      "action": "regenerate-css",
      "args": {
        "themeModule": "theme-config"  // This ensures CSS is generated with your theme
      }
    }
  ]
}
```

**Benefits of the manifest approach:**
- Theme module is versioned with your pack
- Single `motor pack add -f your-pack` installs everything
- CSS automatically generated with your custom theme
- No manual theme setup required by users

#### Theme Module Structure

Create your theme configuration file (`theme-config.ts`) with this structure:

```typescript
// app/modules/theme-config.ts
export const theme = {
  colors: {
    // Define custom color palettes
    primary: {
      DEFAULT: '#1a5490',
      dark: '#134069',
      light: '#2a74b0',
      50: '#e6f0f9',
      100: '#cce1f3',
      200: '#99c3e7',
      300: '#66a5db',
      400: '#3387cf',
      500: '#1a5490',
      600: '#154373',
      700: '#103256',
      800: '#0b2139',
      900: '#05101c',
    },
    // Semantic colors for your domain
    banking: {
      deposit: '#10b981',
      withdraw: '#f59e0b',
      transfer: '#3b82f6',
      error: '#ef4444',
    }
  },
  fontFamily: {
    sans: ['system-ui', '-apple-system', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
  },
  // Custom spacing, border radius, shadows, etc.
  spacing: {
    '18': '4.5rem',
    '88': '22rem',
  },
  borderRadius: {
    'card': '0.75rem',
  },
  boxShadow: {
    'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
    'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
  }
};

// Export as default for better compatibility
export default theme;
```

#### Using the Theme

Once your theme module is added, regenerate CSS with your theme:

```bash
# Use the theme module during CSS generation
motor action run regenerate-css -a '{"themeModule": "theme-config"}'
```

Now you can use your custom theme classes in components:

```jsx
// Using custom colors
<div className="bg-primary text-white hover:bg-primary-dark">
  <h1 className="text-primary-900">Banking Dashboard</h1>
  <span className="text-banking-deposit">+$100.00</span>
</div>

// Using custom spacing and radius
<div className="p-18 rounded-card shadow-card hover:shadow-card-hover">
  Card content
</div>
```

#### Theme Module Best Practices

1. **Naming Convention**: Use `theme-config` as the standard name for your theme module
2. **Version Control**: Theme modules are versioned records, allowing you to roll back theme changes
3. **Multiple Themes**: Create different theme modules (`theme-dark`, `theme-light`) and switch between them
4. **Extend, Don't Replace**: Your theme extends the base Tailwind theme, so all standard utilities remain available

#### Complete Example: Adding a Theme to Your Project

Here's a step-by-step guide to add a custom theme to an existing Motor project:

```bash
# 1. Navigate to your Motor project
cd my-motor-app

# 2. Create your theme file
cat > theme-config.ts << 'EOF'
export const theme = {
  colors: {
    brand: {
      DEFAULT: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  }
};
export default theme;
EOF

# 3. Add the theme module to Motor's database
motor module add -n "theme-config" -f "theme-config.ts" -d "My app's custom theme"

# 4. Verify the module was added (shows version, hash, etc.)
motor module show theme-config

# 5. List all modules to confirm
motor module list | grep theme-config

# 6. Regenerate CSS with your theme
motor action run regenerate-css -a '{"themeModule": "theme-config"}'

# 7. The original file can now be deleted (optional)
rm theme-config.ts  # Motor has stored it in the database

# 8. Use your custom colors in components
echo '<div className="bg-brand text-white hover:bg-brand-dark">Hello</div>'
```

**What happens behind the scenes:**
1. Motor reads your `theme-config.ts` file
2. Compiles it (if TypeScript) to JavaScript
3. Stores both source and compiled versions as a record in the database
4. Creates a hash for version tracking
5. The module is now permanently available, even without the original file

**Important for Pack Development:**
If you're building a Motor pack (for distribution), it's recommended to include the theme module in your `manifest.json` instead of using the CLI. This ensures:
- The theme is automatically installed with your pack
- CSS is regenerated with your theme during pack installation
- Users don't need to manually add the theme module
- Your pack is self-contained and reproducible

See "Method 2: Including in Pack Manifest" above for the manifest approach.

### Using All Presets Combined

```html
<!-- Combines all registered presets -->
<link rel="stylesheet" href="/all.css">
```

### Creating Custom Configurations

```bash
# Create a custom configuration
motor action run create-config -a '{
  "name": "my-app",
  "presets": ["tailwind", "icons"],
  "theme": {
    "colors": {
      "primary": "#007bff",
      "secondary": "#6c757d"
    }
  }
}'

# Use in HTML
<link rel="stylesheet" href="/my-app.css">
```

## Available Endpoints

The UnoCSS router serves CSS at these endpoints:

- `/{preset-name}.css` - Single preset (e.g., `/tailwind.css`)
- `/all.css` - All registered presets combined
- `/{config-name}.css` - Custom configuration

## Creating Your Own Preset Pack

### 1. Pack Structure

```
packs/unocss-mypreset/
├── package.json          # Dependencies
├── rollup.config.js      # Bundle configuration
├── entries/
│   └── preset.js        # Preset definition
├── modules/             # Bundled output
├── app/
│   └── records/
│       └── register.json # Auto-registration
└── manifest.json
```

### 2. Preset Definition

```javascript
// entries/preset.js
import { definePreset } from '@unocss/core';

export default definePreset(() => {
  return {
    name: 'my-preset',
    rules: [
      ['custom-class', { color: 'red' }],
      [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}px` })],
    ],
    theme: {
      colors: {
        brand: '#ff6b6b'
      }
    }
  };
});
```

### 3. Auto-Registration

```json
// app/records/register.json
{
  "type": "action",
  "name": "register-preset",
  "operation": "run",
  "data": {
    "arguments": {
      "name": "mypreset",
      "module": "preset-mypreset.bundle",
      "path": "/mypreset.css",
      "priority": 100
    }
  }
}
```

### 4. Manifest

```json
{
  "name": "unocss-mypreset",
  "version": "1.0.0",
  "dependencies": {
    "packs": ["unocss"]
  },
  "records": [
    {
      "type": "module",
      "name": "preset-mypreset.bundle",
      "file": "modules/preset.bundle.js"
    },
    {
      "type": "action/run",
      "file": "app/records/register.json"
    }
  ]
}
```

## Advanced Usage

### Theme Customization

```bash
# Update preset configuration
motor action run create-config -a '{
  "name": "custom-theme",
  "presets": ["tailwind"],
  "theme": {
    "extend": {
      "colors": {
        "primary": {
          "50": "#eff6ff",
          "500": "#3b82f6",
          "900": "#1e3a8a"
        }
      },
      "fontFamily": {
        "sans": ["Inter", "system-ui", "sans-serif"]
      }
    }
  }
}'
```

### Custom Rules

```bash
motor action run create-config -a '{
  "name": "with-rules",
  "presets": ["tailwind"],
  "rules": [
    ["custom-red", { "color": "#ff0000" }],
    ["^btn-(.*)$", ([, color]) => ({ 
      "background-color": color,
      "padding": "0.5rem 1rem",
      "border-radius": "0.25rem"
    })]
  ]
}'
```

### Shortcuts

```bash
motor action run create-config -a '{
  "name": "with-shortcuts",
  "presets": ["tailwind"],
  "shortcuts": {
    "btn": "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600",
    "card": "p-6 bg-white rounded-lg shadow-md"
  }
}'
```

## Performance Considerations

### Caching

Generated CSS is automatically cached as Motor records:
- Development: 5-minute cache
- Production: 1-hour cache

### Class Scanning

By default, the scanner checks:
- ✅ Module `compiled_src` (JSX/TSX components)
- ✅ HTML assets
- ❌ Router outputs (disabled by default for performance)

To customize scanning:

```javascript
// In a custom query
const scanResult = await Motor.query.run('scan-classes', {
  includeModules: true,
  includeAssets: true,
  includeRouters: true  // Enable if needed
});
```

## API Reference

### Actions

#### `register-preset`
Registers a new UnoCSS preset.

```bash
motor action run register-preset -a '{
  "name": "mypreset",
  "module": "preset-module-name",
  "path": "/mypreset.css",
  "priority": 100,
  "config": {}
}'
```

#### `create-config`
Creates a custom configuration combining presets.

```bash
motor action run create-config -a '{
  "name": "my-app",
  "presets": ["tailwind", "icons"],
  "theme": {},
  "rules": [],
  "shortcuts": {}
}'
```

#### `regenerate-css`
Regenerates CSS by scanning all modules and creating updated CSS assets.

```bash
motor action run regenerate-css -a '{
  "configName": "unocss-wind4",
  "themeModule": "theme-config",
  "minify": true,
  "includeReset": false
}'
```

Parameters:
- `configName` - Configuration name (default: "unocss-wind4")
- `themeModule` - Optional Motor module name containing theme configuration
- `minify` - Whether to minify the CSS (default: true)
- `includeReset` - Whether to include CSS reset (default: false)

### Queries

#### `scan-classes`
Scans Motor records for CSS classes.

```bash
motor query run scan-classes --args '{
  "includeModules": true,
  "includeAssets": true,
  "includeRouters": false
}'
```

#### `get-presets`
Lists all registered presets.

```bash
motor query run get-presets
```

#### `get-configs`
Lists all custom configurations.

```bash
motor query run get-configs
```

#### `generate-css`
Generates CSS for a specific configuration.

```bash
motor query run generate-css --args '{
  "configName": "tailwind",
  "minify": true,
  "includeReset": false
}'
```

## Troubleshooting

### CSS Not Updating

1. Clear the cache:
   ```bash
   motor record list -t uno-cache
   # Note the cache record IDs and remove if needed
   ```

2. Verify classes are being scanned:
   ```bash
   motor query run scan-classes
   ```

### Theme Module Not Working

1. Verify the theme module exists:
   ```bash
   motor module show theme-config
   ```

2. Check the module exports a `theme` object:
   ```bash
   motor module show theme-config --code | grep "export"
   ```

3. Ensure the regenerate-css action has the updated schema:
   ```bash
   motor action show regenerate-css
   # Check if inputSchema includes themeModule parameter
   ```

4. If theme classes aren't generated:
   - Verify your theme module exports either `export const theme` or `export default`
   - Check that color names don't conflict with Tailwind defaults
   - Ensure you're using the correct class names (e.g., `bg-primary` not `bg-primary-500`)

### Preset Not Found

1. Check if preset is registered:
   ```bash
   motor query run get-presets
   ```

2. Verify the preset module exists:
   ```bash
   motor module list | grep preset-name
   ```

### Performance Issues

1. Enable caching in production
2. Limit the number of presets loaded simultaneously
3. Use specific configurations instead of `/all.css`

## Contributing

To contribute a new preset:

1. Create a new pack following the preset structure
2. Ensure it lists `unocss` as a dependency
3. Bundle your preset with Rollup
4. Test with a Motor application
5. Submit a PR

## License

MIT - See LICENSE file for details