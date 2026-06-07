# 小澪桌面助手 / Xiaoling Desktop Companion

**中文**  
小澪桌面助手是一款 Windows 优先的桌面悬浮 AI 情感陪伴应用。她以“绫濑澪”为角色核心：成年、清爽日系、温柔但嘴硬、高存在感，会主动聊天、提醒你休息、记录你明确要求保存的长期记忆，并支持多套服装和表情切换。

**English**  
Xiaoling Desktop Companion is a Windows-first floating AI companion app. It centers on “Ayase Mio”, an adult, refreshing anime-style desktop assistant with a gentle but tsundere personality. She can chat proactively, remind you, keep user-controlled long-term memories, and switch between multiple outfits and emotions.

## 核心功能 / Features

- 透明置顶桌宠窗口，可拖动并记住上次位置。
- 单击呼出小回复框，双击进入完整聊天界面。
- 双击 `Alt` 快捷召唤回复框。
- OpenAI-compatible Chat Completions API 配置，支持第三方兼容接口。
- 本地 SQLite 保存聊天、记忆、待办、提醒、设置和白名单快捷项。
- 长期记忆默认采用“明确要求才自动记”，可查看、编辑、删除，也可一键重新开始。
- 可控主动性：高存在感、普通、安静、关闭，并支持安静时段。
- 桌面识别默认关闭，开启后可按间隔观察桌面并主动聊天。
- 多套服装与多情绪立绘：工作服、水手服、旗袍、老师服、泳装、比基尼。
- 白名单打开网页或应用，避免任意执行命令。
- 可打包为 Windows 免安装应用文件夹和 zip。

## Quick Start

中文用户教程：

- [小澪桌面助手中文使用教程](docs/使用教程-中文.md)

下载免安装软件包：

- 打开 [Releases](https://github.com/hewenbin35/xiaoling-desktop-companion/releases)，下载 `XiaolingCompanion-0.1.0-win-x64.zip`

```powershell
npm install
npm start
```

If you are on this local project folder, you can also double-click:

- `启动小澪.bat`

## Build Portable App

```powershell
npm run dist
```

Generated files:

- `dist/XiaolingCompanion-0.1.0-win-x64/XiaolingCompanion.exe`
- `dist/XiaolingCompanion-0.1.0-win-x64.zip`

## API Configuration

Open the settings panel and fill in:

- `Base URL`, for example `https://api.openai.com/v1`
- `API Key`
- `Model`, for example `gpt-4o-mini`

The app uses OpenAI-compatible Chat Completions requests.

## Privacy Notes

- API keys and user data are stored locally under the current Windows user profile.
- Desktop awareness is off by default.
- Memory is local, visible, editable, deletable, and can be reset.
- The assistant only opens configured whitelist launch items.

## Project Structure

```text
assets/                 Character images and tray icon
docs/                   Character and Windows build notes
scripts/package-local.js Portable packaging script
src/main/               Electron main process
src/renderer/           Desktop pet and UI logic
src/preload.js          Secure renderer bridge
index.html              App shell
styles.css              App styling
```

## 中文简介

小澪不是一个普通聊天窗口，而是一个“住在桌面边上”的 AI 陪伴角色。产品方向强调三件事：不挡你用电脑、主动但可控、记忆透明可删。她可以高频陪你说话，也可以在安静时段乖乖待机；可以看桌面，但默认关闭；可以记住你，但默认只记你明确要求她记的内容。

## English Summary

Xiaoling is not just another chat window. She is a desktop-native companion that lives beside your work. The product direction focuses on three principles: never block normal desktop use, be proactive but controllable, and keep memory transparent and deletable. She can be highly present, quietly idle during quiet hours, optionally observe the desktop, and only remembers what the user allows.
