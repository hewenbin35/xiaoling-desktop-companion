const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const electronDist = path.join(root, "node_modules", "electron", "dist");
const outputRoot = path.join(root, "dist");
const appName = "小澪桌面助手";
const exeName = "小澪桌面助手.exe";
const folderName = "小澪桌面助手";
const version = require(path.join(root, "package.json")).version;
const portableDir = path.join(outputRoot, `${folderName}-${version}-win-x64`);
const appDir = path.join(portableDir, "resources", "app");
const zipPath = path.join(outputRoot, `${folderName}-${version}-win-x64.zip`);
const stalePortableDir = path.join(outputRoot, `XiaolingCompanion-${version}-win-x64`);
const staleZipPath = path.join(outputRoot, `XiaolingCompanion-${version}-win-x64.zip`);

const appFiles = [
  "index.html",
  "styles.css",
  "src",
  "assets",
  "docs",
];

function copy(from, to) {
  fs.cpSync(from, to, {
    recursive: true,
    force: true,
    filter: (source) => !source.includes(`${path.sep}.git${path.sep}`),
  });
}

function removeIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

if (!fs.existsSync(path.join(electronDist, "electron.exe"))) {
  throw new Error("没找到 Electron 运行时，请先运行 npm install。");
}

removeIfExists(portableDir);
removeIfExists(zipPath);
removeIfExists(stalePortableDir);
removeIfExists(staleZipPath);
fs.mkdirSync(appDir, { recursive: true });

copy(electronDist, portableDir);

const defaultApp = path.join(portableDir, "resources", "default_app.asar");
removeIfExists(defaultApp);

const exePath = path.join(portableDir, "electron.exe");
const renamedExePath = path.join(portableDir, exeName);
if (fs.existsSync(exePath)) {
  fs.renameSync(exePath, renamedExePath);
}

for (const file of appFiles) {
  copy(path.join(root, file), path.join(appDir, file));
}

fs.writeFileSync(
  path.join(appDir, "package.json"),
  JSON.stringify(
    {
      name: "desktop-ai-companion-runtime",
      version,
      productName: appName,
      main: "src/main/main.js",
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(portableDir, "启动小澪.bat"),
  `@echo off\r\ncd /d "%~dp0"\r\nstart "" "%~dp0${exeName}"\r\n`,
  "utf8"
);

const compress = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `Compress-Archive -LiteralPath ${JSON.stringify(portableDir)} -DestinationPath ${JSON.stringify(zipPath)} -Force`,
  ],
  { stdio: "inherit" }
);

if (compress.status !== 0) {
  console.warn("zip 压缩失败，但便携应用文件夹已经生成。");
}

console.log("");
console.log("小澪打包完成：");
console.log(`- 双击启动：${path.join(portableDir, exeName)}`);
console.log(`- 中文入口：${path.join(portableDir, "启动小澪.bat")}`);
console.log(`- 发给别人：${zipPath}`);
