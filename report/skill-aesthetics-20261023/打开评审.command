#!/bin/zsh
set -e
report_dir="${0:A:h}"
if command -v node >/dev/null 2>&1; then
  node "$report_dir/preview.mjs" --open
elif [[ -x /usr/local/bin/node ]]; then
  /usr/local/bin/node "$report_dir/preview.mjs" --open
elif [[ -x /opt/homebrew/bin/node ]]; then
  /opt/homebrew/bin/node "$report_dir/preview.mjs" --open
else
  print '未找到 Node.js。可直接用 Safari 或 Chrome 打开本目录的 index.html。'
  read -k 1 '?按任意键关闭。'
fi
