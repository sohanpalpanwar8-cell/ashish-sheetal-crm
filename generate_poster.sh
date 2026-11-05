#!/bin/bash
set -e

# Resize QR to 440x440 with clean quiet zone
convert public/crm_barcode.png -resize 440x440 public/qr_440.png

# Create base poster with perfect spacing and margins
convert -size 900x1350 xc:"#090e1a" \
  -stroke "#fbbf24" -strokewidth 3 -fill "#131b2e" -draw "roundrectangle 20,20 880,1330 24,24" \
  -stroke "#38bdf8" -strokewidth 1.5 -fill none -draw "roundrectangle 30,30 870,1320 18,18" \
  -stroke none \
  -font DejaVu-Sans-Bold -pointsize 15 -fill "#93c5fd" -gravity north -annotate +0+55 "OFFICIAL MOBILE APPLICATION" \
  -font DejaVu-Sans-Bold -pointsize 42 -fill "#fbbf24" -gravity north -annotate +0+85 "ASHISH SHEETAL" \
  -font DejaVu-Sans-Bold -pointsize 32 -fill "#ffffff" -gravity north -annotate +0+138 "ALL-IN-ONE CRM" \
  -font DejaVu-Sans -pointsize 18 -fill "#94a3b8" -gravity north -annotate +0+185 "Property  |  Insurance  |  Finance  |  Multi-Services" \
  -stroke none -fill "#ffffff" -draw "roundrectangle 160,225 740,785 24,24" \
  -fill "#0f172a" -draw "roundrectangle 190,715 710,765 14,14" \
  -font DejaVu-Sans-Bold -pointsize 16 -fill "#38bdf8" -gravity north -annotate +0+733 "SCAN WITH ANY MOBILE CAMERA / SCANNER" \
  -stroke "#38bdf8" -strokewidth 2 -fill "#0d1527" -draw "roundrectangle 75,815 825,905 16,16" \
  -stroke none \
  -font DejaVu-Sans -pointsize 13 -fill "#94a3b8" -gravity north -annotate +0+830 "WEBSITE DIRECT LINK" \
  -font DejaVu-Sans-Bold -pointsize 23 -fill "#38bdf8" -gravity north -annotate +0+860 "https://ashish-sheetal-crm.vercel.app" \
  -stroke "#6366f1" -strokewidth 2 -fill "#131b2e" -draw "roundrectangle 75,925 825,1145 18,18" \
  -stroke none \
  -font DejaVu-Sans-Bold -pointsize 18 -fill "#a5b4fc" -gravity north -annotate +0+945 "QUICK LOGIN SECURITY PINS" \
  -stroke "#334155" -strokewidth 1 -fill "#0a0f1d" -draw "roundrectangle 100,980 435,1125 14,14" \
  -stroke "#334155" -strokewidth 1 -fill "#0a0f1d" -draw "roundrectangle 465,980 800,1125 14,14" \
  -stroke none \
  -font DejaVu-Sans -pointsize 17 -fill "#cbd5e1" -gravity north -annotate -182+1005 "Ashish Panwar" \
  -font DejaVu-Sans-Bold -pointsize 32 -fill "#fbbf24" -gravity north -annotate -182+1052 "12345678" \
  -font DejaVu-Sans -pointsize 17 -fill "#cbd5e1" -gravity north -annotate +182+1005 "Sheetal Panwar" \
  -font DejaVu-Sans-Bold -pointsize 32 -fill "#38bdf8" -gravity north -annotate +182+1052 "22222222" \
  -font DejaVu-Sans -pointsize 15 -fill "#64748b" -gravity north -annotate +0+1220 "Cloud Secured Application  |  Auto-Sync Across All Devices" \
  public/base_poster.png

# Center QR code inside the white box: x=230, y=250
composite -geometry +230+250 public/qr_440.png public/base_poster.png public/ashish_sheetal_crm_poster.png

echo "Perfect poster created!"
ls -lh public/ashish_sheetal_crm_poster.png
