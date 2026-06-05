@echo off
setlocal
cd /d "%~dp0"

if not exist package.json (
  echo 没找到 package.json。请把这个启动文件放在小澪工程根目录。
  pause
  exit /b 1
)

if not exist node_modules\electron\dist\electron.exe (
  echo 正在安装依赖，第一次启动会慢一点...
  npm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查 Node.js/npm 和网络。
    pause
    exit /b 1
  )
)

npm start
