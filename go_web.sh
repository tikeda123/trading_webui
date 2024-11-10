#!/bin/bash

# ログファイルのパスを定義
LOGFILE="webui.log"

# market_data_updater.pyをバックグラウンドで実行し、出力をログにリダイレクト
nohup npm start > "$LOGFILE" 2>&1 &

# プロセスIDを表示
echo "Process started with PID: $!"

