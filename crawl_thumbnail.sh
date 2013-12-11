#! /bin/sh

if [ $# -ne 2 ]; then
  echo "usage: $0 url output" >&2
  exit 1
fi

case `uname -a` in
  Darwin*)
    BIN=wkhtmltoimage-mac
    TIMEOUT=gtimeout
    RUN=
    OPTIONS=
    ;;
  *)
    BIN=wkhtmltoimage-amd64
    TIMEOUT=timeout
    RUN="xvfb-run --auto-servernum --server-args=\"-screen 0, 1024x768x24\""
    OPTIONS="--use-xserver"
    ;;
esac
ROOT=`dirname "$0"`

CMD="$TIMEOUT 30 $RUN \"$ROOT/$BIN\" --height 768 $OPTIONS --javascript-delay 10000 \"$1\" \"$2\" && convert \"$2\" -resize '100!x100' \"$2\""
eval $CMD
