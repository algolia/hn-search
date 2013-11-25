#! /bin/sh

#BIN=wkhtmltoimage-amd64
BIN=wkhtmltoimage-mac

if [ $# -ne 1 ]; then
  echo "usage: $0 /path/to/export" >&2
  exit 1
fi

ROOT=`dirname "$0"`

while read line; do
  id=`echo "$line" | cut -d' ' -f1`
  url=`echo "$line" | cut -d' ' -f2`

  timeout 30 xvfb-run --auto-servernum --server-args="-screen 0, 1024x768x24" $ROOT/$BIN --height 768 "$url" $id.png && convert $id.png -resize '100!x100' $id.png
  #>/dev/null 2>&1
done < $1
