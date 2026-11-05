#!/bin/bash
set -e

# Generate master 512x512 app icon
convert -size 512x512 xc:"#0b132b" \
  -stroke "#fbbf24" -strokewidth 8 -fill "#131b2e" -draw "roundrectangle 16,16 496,496 90,90" \
  -stroke "#38bdf8" -strokewidth 3 -fill none -draw "roundrectangle 26,26 486,486 80,80" \
  -stroke none \
  -font DejaVu-Sans-Bold -pointsize 180 -fill "#fbbf24" -gravity center -annotate +0-30 "AS" \
  -font DejaVu-Sans-Bold -pointsize 32 -fill "#38bdf8" -gravity center -annotate +0+120 "ALL-IN-ONE" \
  -font DejaVu-Sans -pointsize 20 -fill "#94a3b8" -gravity center -annotate +0+165 "CRM • PROPERTY • INSURANCE" \
  public/pwa-512x512.png

# Generate 192x192 icon
convert public/pwa-512x512.png -resize 192x192 public/pwa-192x192.png

# Generate Apple touch icon 180x180
convert public/pwa-512x512.png -resize 180x180 public/apple-touch-icon.png

# Generate maskable 512x512 icon (15% padding so it never clips when cropped to circle/squircle)
convert -size 512x512 xc:"#0b132b" \
  public/pwa-512x512.png -resize 410x410 -gravity center -composite \
  public/pwa-maskable-512x512.png

# Generate favicon.ico
convert public/pwa-192x192.png -resize 64x64 public/favicon.ico

echo "All PWA icons generated successfully!"
ls -la public/pwa*.png public/apple-touch-icon.png public/favicon.ico
