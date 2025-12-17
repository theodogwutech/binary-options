# Satoshi Font Installation

## Required Font Files

You need to download the **Satoshi Variable Font** and place it in this directory.

### Option 1: Download from Official Source
1. Visit: https://www.fontshare.com/fonts/satoshi
2. Click "Download family" button
3. Extract the downloaded ZIP file
4. Copy `Satoshi-Variable.woff2` to this `public/fonts/` directory

### Option 2: Download from GitHub
1. Visit: https://github.com/satoshi-font/satoshi
2. Download the font files
3. Copy `Satoshi-Variable.woff2` to this directory

### Option 3: Use Alternative CDN Method

If you prefer not to download, you can use the CDN version by updating `src/app/layout.tsx`:

```tsx
// Add this to the <head> section
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap" rel="stylesheet" />
```

## Current Setup

The project is configured to use:
- Font: Satoshi Variable
- Weights: 300-900
- Format: WOFF2
- Fallback: system-ui, arial

## File Structure

```
public/
  fonts/
    Satoshi-Variable.woff2  <- Place font file here
    FONT_INSTRUCTIONS.md    <- This file
```

Once you add the font file, the application will automatically use it!
