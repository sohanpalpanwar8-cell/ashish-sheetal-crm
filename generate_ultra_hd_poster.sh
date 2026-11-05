#!/bin/bash
set -e

# Resize high-res QR to 880x880 with crisp edge definition
convert public/qr_1000.png -resize 880x880 public/qr_880.png

# Generate 1800x2700 Ultra-HD canvas (no -density scaling issue)
convert -size 1800x2700 xc:"#090e1a" \
  -stroke "#fbbf24" -strokewidth 6 -fill "#131b2e" -draw "roundrectangle 40,40 1760,2660 48,48" \
  -stroke "#38bdf8" -strokewidth 3 -fill none -draw "roundrectangle 60,60 1740,2640 36,36" \
  -stroke none \
  -font DejaVu-Sans-Bold -pointsize 30 -fill "#93c5fd" -gravity north -annotate +0+110 "OFFICIAL MOBILE APPLICATION" \
  -font DejaVu-Sans-Bold -pointsize 84 -fill "#fbbf24" -gravity north -annotate +0+170 "ASHISH SHEETAL" \
  -font DejaVu-Sans-Bold -pointsize 64 -fill "#ffffff" -gravity north -annotate +0+276 "ALL-IN-ONE CRM" \
  -font DejaVu-Sans -pointsize 36 -fill "#94a3b8" -gravity north -annotate +0+370 "Property  |  Insurance  |  Finance  |  Multi-Services" \
  -stroke none -fill "#ffffff" -draw "roundrectangle 320,450 1480,1570 48,48" \
  -fill "#0f172a" -draw "roundrectangle 380,1430 1420,1530 28,28" \
  -font DejaVu-Sans-Bold -pointsize 32 -fill "#38bdf8" -gravity north -annotate +0+1466 "SCAN WITH ANY MOBILE CAMERA / SCANNER" \
  -stroke "#38bdf8" -strokewidth 4 -fill "#0d1527" -draw "roundrectangle 150,1630 1650,1810 32,32" \
  -stroke none \
  -font DejaVu-Sans -pointsize 26 -fill "#94a3b8" -gravity north -annotate +0+1660 "WEBSITE DIRECT LINK" \
  -font DejaVu-Sans-Bold -pointsize 46 -fill "#38bdf8" -gravity north -annotate +0+1720 "https://ashish-sheetal-crm.vercel.app" \
  -stroke "#6366f1" -strokewidth 4 -fill "#131b2e" -draw "roundrectangle 150,1850 1650,2290 36,36" \
  -stroke none \
  -font DejaVu-Sans-Bold -pointsize 36 -fill "#a5b4fc" -gravity north -annotate +0+1890 "QUICK LOGIN SECURITY PINS" \
  -stroke "#334155" -strokewidth 2 -fill "#0a0f1d" -draw "roundrectangle 200,1960 870,2250 28,28" \
  -stroke "#334155" -strokewidth 2 -fill "#0a0f1d" -draw "roundrectangle 930,1960 1600,2250 28,28" \
  -stroke none \
  -font DejaVu-Sans -pointsize 34 -fill "#cbd5e1" -gravity north -annotate -365+2010 "Ashish Panwar" \
  -font DejaVu-Sans-Bold -pointsize 64 -fill "#fbbf24" -gravity north -annotate -365+2104 "12345678" \
  -font DejaVu-Sans -pointsize 34 -fill "#cbd5e1" -gravity north -annotate +365+2010 "Sheetal Panwar" \
  -font DejaVu-Sans-Bold -pointsize 64 -fill "#38bdf8" -gravity north -annotate +365+2104 "22222222" \
  -font DejaVu-Sans -pointsize 30 -fill "#64748b" -gravity north -annotate +0+2440 "Cloud Secured Application  |  Auto-Sync Across All Devices" \
  public/base_poster_hd.png

# Composite 880x880 QR at x=460, y=500
composite -geometry +460+500 public/qr_880.png public/base_poster_hd.png public/ashish_sheetal_crm_poster.png

cp public/ashish_sheetal_crm_poster.png public/ashish_sheetal_crm_poster_4k.png

echo "Ultra-HD 4K Poster successfully created!"
ls -lh public/ashish_sheetal_crm_poster.png public/ashish_sheetal_crm_poster_4k.png
