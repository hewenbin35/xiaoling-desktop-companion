# 小澪桌面助手 Windows 打包说明

## 本机启动

在工程根目录双击：

- `启动小澪.bat`

或在 PowerShell 中运行：

```powershell
L:
cd \gmaeAAAAA
npm install
npm start
```

## 打包发给别人

在工程根目录双击：

- `打包小澪.bat`

或运行：

```powershell
npm run dist
```

打包完成后查看 `dist` 文件夹：

- `小澪桌面助手-0.1.0-win-x64`：免安装应用文件夹。
- `小澪桌面助手-0.1.0-win-x64.zip`：压缩包，可以直接发给别人。

运行入口：

- 推荐双击 `小澪桌面助手.exe`。
- 如果中文环境下更顺手，也可以双击 `启动小澪.bat`。

## 安装器版本

如果网络能正常访问 GitHub，可以尝试：

```powershell
npm run dist:installer
```

这个命令会生成安装版和便携版，但第一次可能需要下载 Electron 官方压缩包。

## 注意事项

- 默认 `npm run dist` 使用本机已安装的 Electron 运行时，不需要临时下载 GitHub 文件。
- 对方电脑不需要安装 Node.js。
- API Key、记忆、待办、提醒和设置保存在使用者自己的 Windows 用户目录里，不会被打进安装包。
- 如果 Windows 提示未知发布者，这是因为当前没有代码签名证书；选择“更多信息”后仍可运行。
