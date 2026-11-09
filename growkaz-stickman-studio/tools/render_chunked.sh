#!/bin/bash
# Resumable chapter renderer: renders [from,to) in ~60 s chunks (frame-aligned), skips chunks already done,
# joins them into part_chN.mp4 and muxes review_chN.mp4 with the mix. Safe to re-run after a restart.
# usage: tools/render_chunked.sh PROJECT N FROM TO   (times in seconds)
P=$1; N=$2; FROM=$3; TO=$4; B=projects/$P/build; mkdir -p $B/segs
cd "$(dirname "$0")/.."
read -r F0 F1 <<< "$(python3 -c "print(round($FROM*24), round($TO*24))")"
k=0; f=$F0; : > $B/segs/ch${N}_list.txt
while [ $f -lt $F1 ]; do
  e=$((f+1440)); [ $e -gt $F1 ] && e=$F1
  out=$B/segs/ch${N}_$(printf %03d $k).mp4
  if [ ! -s $out ]; then
    a=$(python3 -c "print($f/24)"); b=$(python3 -c "print($e/24)")
    node render.mjs --project projects/$P --from $a --to $b --out $out.tmp.mp4 > $B/segs/ch${N}_$k.log 2>&1 && mv $out.tmp.mp4 $out
    [ -s $out ] || { echo "chunk $k failed"; exit 1; }
    echo "ch$N chunk $k done ($f-$e), errors: $(grep -c 'SHOT ERROR' $B/segs/ch${N}_$k.log)"
  fi
  echo "file '$PWD/$out'" >> $B/segs/ch${N}_list.txt; f=$e; k=$((k+1))
done
ffmpeg -v error -y -f concat -safe 0 -i $B/segs/ch${N}_list.txt -c copy -movflags +faststart $B/part_ch$N.mp4
[ -s $B/mix.wav ] || python3 audio/mix.py --project projects/$P > /dev/null 2>&1
ffmpeg -v error -y -i $B/part_ch$N.mp4 -ss $FROM -i $B/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $B/review_ch$N.mp4
echo "REVIEW_OK ch$N $(ffprobe -v error -show_entries format=duration -of csv=p=0 $B/review_ch$N.mp4)"
