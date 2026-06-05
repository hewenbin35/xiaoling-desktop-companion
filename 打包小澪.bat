@echo off
setlocal
cd /d "%~dp0"

if not exist package.json (
  echo 没找到 package.json。请把这个打包文件放在小澪工程根目录。
  pause
  exit /b 1
)

if not exist node_modules (
  echo 正在安装依赖...
  npm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查 Node.js/npm 和网络。
    pause
    exit /b 1
  )
)

echo 正在检查代码...
npm run check
if errorlevel 1 (
  echo 代码检查失败，先修好再打包。
  pause
  exit /b 1
)

echo 正在打包 Windows 应用...
npm run dist
if errorlevel 1 (
  echo 打包失败，请查看上面的错误。
  pause
  exit /b 1
)

echo.
echo 打包完成。文件在 dist 文件夹里：
echo - XiaolingCompanion-0.1.0-win-x64：免安装应用文件夹
echo - 里面双击 XiaolingCompanion.exe，或双击 启动小澪.bat
echo - XiaolingCompanion-0.1.0-win-x64.zip：压缩后发给别人
echo.
pause
