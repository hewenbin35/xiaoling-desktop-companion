const el = {
  avatarButton: document.getElementById("avatarButton"),
  petCloseButton: document.getElementById("petCloseButton"),
  bubble: document.getElementById("bubble"),
  miniReply: document.getElementById("miniReply"),
  miniInput: document.getElementById("miniInput"),
  chatPanel: document.getElementById("chatPanel"),
  settingsPanel: document.getElementById("settingsPanel"),
  settingsButton: document.getElementById("settingsButton"),
  observeButton: document.getElementById("observeButton"),
  collapseButton: document.getElementById("collapseButton"),
  closeSettingsButton: document.getElementById("closeSettingsButton"),
  composer: document.getElementById("composer"),
  messageInput: document.getElementById("messageInput"),
  messages: document.getElementById("messages"),
  apiBaseURL: document.getElementById("apiBaseURL"),
  apiKey: document.getElementById("apiKey"),
  apiModel: document.getElementById("apiModel"),
  voiceEnabled: document.getElementById("voiceEnabled"),
  screenAwarenessEnabled: document.getElementById("screenAwarenessEnabled"),
  screenAwarenessInterval: document.getElementById("screenAwarenessInterval"),
  avatarOutfit: document.getElementById("avatarOutfit"),
  presenceLevel: document.getElementById("presenceLevel"),
  presenceInterval: document.getElementById("presenceInterval"),
  quietHoursEnabled: document.getElementById("quietHoursEnabled"),
  quietStart: document.getElementById("quietStart"),
  quietEnd: document.getElementById("quietEnd"),
  memoryEnabled: document.getElementById("memoryEnabled"),
  memoryExplicitOnly: document.getElementById("memoryExplicitOnly"),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  resetDataButton: document.getElementById("resetDataButton"),
  resetDataButtonApi: document.getElementById("resetDataButtonApi"),
  memoryList: document.getElementById("memoryList"),
  todoForm: document.getElementById("todoForm"),
  todoInput: document.getElementById("todoInput"),
  todoList: document.getElementById("todoList"),
  reminderForm: document.getElementById("reminderForm"),
  reminderInput: document.getElementById("reminderInput"),
  reminderList: document.getElementById("reminderList"),
  launchForm: document.getElementById("launchForm"),
  launchName: document.getElementById("launchName"),
  launchTarget: document.getElementById("launchTarget"),
  launchKind: document.getElementById("launchKind"),
  launchList: document.getElementById("launchList"),
};

let settings = null;
let bubbleTimer = null;
let bubbleQueue = [];
let bubbleShowing = false;
let presenceTimer = null;
let desktopTimer = null;
let idlePoutTimer = null;
let emotionTimer = null;
let clickCount = 0;
let clickTimer = null;
let observing = false;
let dragState = null;
let suppressNextClick = false;
let lastUserInteraction = Date.now();
let shapeTimer = null;
let windowMode = "pet";
let resetArmed = false;
let resetArmTimer = null;

const presenceLines = [
  ["喂，别装没听见。现在在干嘛？", "pout"],
  ["你已经安静很久了，我合理怀疑你在摸鱼。", "proud"],
  ["喝水。现在。别让我重复第三遍。", "angry"],
  ["坐姿，笨蛋。你脖子不是一次性用品。", "pout"],
  ["把眼前这件事拆小一点。先做五分钟也算赢。", "proud"],
  ["我在盯着呢。虽然不是担心你，只是顺手。", "shy"],
  ["如果你又开了一堆窗口不干正事，我会笑你的。", "happy"],
];

const poutLines = [
  "哼，这么久不理我。你最好有一个很可爱的理由。",
  "我才没有在等你回话。只是刚好看着这里而已。",
  "再不理我，我就要闹小脾气了。先说好，很容易哄，但你得哄。",
  "笨蛋主人，桌面上有个小澪快被冷落到发霉了。",
];

const gentlePresenceLines = [
  ["我路过看一眼。先喝口水，别把自己熬成干巴巴的工作机器。", "pout"],
  ["安静这么久，是在认真做事，还是又开小差了？我只是合理怀疑。", "proud"],
  ["把眼前这件事拆小一点。先做五分钟，也算赢。", "proud"],
  ["我在旁边盯着呢。不是担心你，只是顺手，哼。", "blush"],
  ["窗口开太多的话，先收掉两个。桌面清一点，脑子也会轻一点。", "happy"],
  ["要不要停十秒？肩膀放松。别让我一会儿又来念你。", "pout"],
];

const gentlePoutLines = [
  "我才没有一直等你回话。只是刚好看着这里而已。",
  "这么久没理我？行吧，我闹一小会儿，哄一下就好。",
  "你要是忙，就先忙。小澪在这边待机，才不是很在意。",
  "回来时记得叫我一声。别误会，我只是方便接住你的话。",
];

async function init() {
  settings = await window.companion.getSettings();
  bindEvents();
  hydrateSettings();
  await refreshMessages();
  await refreshAllLists();
  startPresence();
  startDesktopAwareness();
  startIdlePout();
  setEmotion("happy", 2800);
  say("我来了。单击我就能回复，双击进大界面。要拖我也可以，但别把我丢角落里，哼。", "happy");
}

function bindEvents() {
  window.addEventListener("resize", scheduleWindowShape);
  el.petCloseButton.addEventListener("click", () => window.companion.quitApp());
  el.avatarButton.addEventListener("click", handleAvatarClick);
  el.avatarButton.addEventListener("pointerdown", startAvatarDrag);
  window.addEventListener("pointermove", markAvatarDrag);
  window.addEventListener("pointerup", endAvatarDrag);
  window.addEventListener("pointercancel", endAvatarDrag);
  el.miniReply.addEventListener("submit", sendMiniReply);
  el.miniInput.addEventListener("keydown", handleMiniKeydown);
  el.messageInput.addEventListener("keydown", handleComposerKeydown);
  el.collapseButton.addEventListener("click", () => {
    el.chatPanel.classList.add("hidden");
    syncWindowMode();
    scheduleWindowShape();
  });
  el.settingsButton.addEventListener("click", openSettings);
  el.observeButton.addEventListener("click", observeDesktopNow);
  el.closeSettingsButton.addEventListener("click", () => {
    el.settingsPanel.classList.add("hidden");
    syncWindowMode();
    scheduleWindowShape();
  });
  el.saveSettingsButton.addEventListener("click", saveSettings);
  el.avatarOutfit.addEventListener("change", async () => {
    await saveOutfit(el.avatarOutfit.value);
  });
  el.memoryEnabled.addEventListener("change", saveSettings);
  el.memoryExplicitOnly.addEventListener("change", saveSettings);
  el.resetDataButton.addEventListener("click", resetChatAndMemory);
  el.resetDataButtonApi.addEventListener("click", resetChatAndMemory);
  el.composer.addEventListener("submit", sendChat);
  el.todoForm.addEventListener("submit", createTodo);
  el.reminderForm.addEventListener("submit", createReminder);
  el.launchForm.addEventListener("submit", createLaunchItem);

  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => selectTab(tab.dataset.tab)));
  document.querySelectorAll(".quick-actions button").forEach((button) => {
    button.addEventListener("click", () => {
      openSettings();
      selectTab(button.dataset.action === "memory" ? "memory" : button.dataset.action === "launch" ? "tools" : "tasks");
    });
  });

  window.companion.onOpenSettings(openSettings);
  window.companion.onOpenFull(openFullPanel);
  window.companion.onShowMiniReply(() => {
    showMiniReply();
    say("叫我干嘛？说。", "pout");
  });
  window.companion.onHideMiniReply(() => hideMiniReply());
  window.companion.onError((message) => say(`刚才差点崩了，我先稳住：${message}`, "sad"));
  window.companion.onReminderDue((reminder) => {
    say(`到点了：${reminder.content}。别装没看见。`, "angry");
    speak(`到点了，${reminder.content}`);
    refreshAllLists();
  });
  scheduleWindowShape();
}

function scheduleWindowShape() {
  clearTimeout(shapeTimer);
  shapeTimer = setTimeout(updateWindowShape, 40);
}

async function syncWindowMode() {
  const nextMode = !el.settingsPanel.classList.contains("hidden")
    ? "settings"
    : !el.chatPanel.classList.contains("hidden")
      ? "panel"
      : !el.miniReply.classList.contains("hidden")
        ? "reply"
        : "pet";
  if (nextMode === windowMode) return;
  windowMode = nextMode;
  await window.companion.setWindowMode(nextMode);
  scheduleWindowShape();
}

function updateWindowShape() {
  const pad = 8;
  const rects = Array.from(document.querySelectorAll(".hit-area, .bubble"))
    .filter((node) => !node.classList.contains("hidden") && node.offsetParent !== null)
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left - pad,
        y: rect.top - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      };
    })
    .filter((rect) => rect.width > 4 && rect.height > 4);
  window.companion.setWindowShape(rects);
}

function touchUser() {
  lastUserInteraction = Date.now();
}

function handleMiniKeydown(event) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  el.miniReply.requestSubmit();
}

function handleComposerKeydown(event) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  el.composer.requestSubmit();
}

function handleAvatarClick() {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  clickCount += 1;
  clearTimeout(clickTimer);

  if (clickCount >= 2) {
    clickCount = 0;
    openFullPanel();
    return;
  }

  showMiniReply();
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 650);
}

async function startAvatarDrag(event) {
  if (event.button !== 0) return;
  const [windowX, windowY] = await window.companion.getWindowPosition();
  dragState = {
    startScreenX: event.screenX,
    startScreenY: event.screenY,
    startWindowX: windowX,
    startWindowY: windowY,
    active: true,
    wasDragging: false,
    pointerId: event.pointerId,
  };
  el.avatarButton.setPointerCapture?.(event.pointerId);
}

async function markAvatarDrag(event) {
  if (!dragState?.active) return;
  const dx = event.screenX - dragState.startScreenX;
  const dy = event.screenY - dragState.startScreenY;
  if (Math.abs(dx) + Math.abs(dy) >= 8) {
    dragState.wasDragging = true;
    setEmotion("proud", 800);
    await window.companion.setWindowPosition(dragState.startWindowX + dx, dragState.startWindowY + dy);
  }
}

async function endAvatarDrag() {
  if (!dragState) return;
  suppressNextClick = dragState.wasDragging;
  dragState.active = false;
  if (dragState.pointerId != null) {
    el.avatarButton.releasePointerCapture?.(dragState.pointerId);
  }
  await window.companion.saveWindowPosition();
  scheduleWindowShape();
  setTimeout(() => {
    dragState = null;
  }, 80);
}

function showMiniReply() {
  el.miniReply.classList.remove("hidden");
  el.miniInput.focus();
  syncWindowMode();
  scheduleWindowShape();
}

function hideMiniReply() {
  el.miniReply.classList.add("hidden");
  syncWindowMode();
  scheduleWindowShape();
}

function openFullPanel() {
  el.chatPanel.classList.remove("hidden");
  hideMiniReply();
  refreshMessages();
  el.messageInput.focus();
  syncWindowMode();
  scheduleWindowShape();
}

function hydrateSettings() {
  el.apiBaseURL.value = settings.api.baseURL || "";
  el.apiKey.value = settings.api.apiKey || "";
  el.apiModel.value = settings.api.model || "";
  el.voiceEnabled.checked = Boolean(settings.voice.enabled);
  el.screenAwarenessEnabled.checked = Boolean(settings.screenAwareness?.enabled);
  el.screenAwarenessInterval.value = String(settings.screenAwareness?.intervalSeconds || 75);
  el.memoryEnabled.checked = settings.memory?.enabled !== false;
  el.memoryExplicitOnly.checked = settings.memory?.explicitOnly !== false;
  el.avatarOutfit.value = settings.avatar?.outfit || "work";
  setOutfit(el.avatarOutfit.value);
  el.presenceLevel.value = settings.presence.level || "high";
  el.presenceInterval.value = String(settings.presence.intervalSeconds || 25);
  el.quietHoursEnabled.checked = Boolean(settings.presence.quietHours?.enabled);
  el.quietStart.value = settings.presence.quietHours?.start || "23:30";
  el.quietEnd.value = settings.presence.quietHours?.end || "08:30";
}

async function saveSettings() {
  settings = await window.companion.saveSettings({
    api: {
      baseURL: el.apiBaseURL.value.trim(),
      apiKey: el.apiKey.value.trim(),
      model: el.apiModel.value.trim(),
    },
    voice: {
      enabled: el.voiceEnabled.checked,
    },
    presence: {
      level: el.presenceLevel.value,
      intervalSeconds: clamp(Number(el.presenceInterval.value || 25), 10, 600),
      quietHours: {
        enabled: el.quietHoursEnabled.checked,
        start: el.quietStart.value || "23:30",
        end: el.quietEnd.value || "08:30",
      },
    },
    screenAwareness: {
      enabled: el.screenAwarenessEnabled.checked,
      confirmed: true,
      intervalSeconds: clamp(Number(el.screenAwarenessInterval.value || 75), 30, 900),
    },
    memory: {
      enabled: el.memoryEnabled.checked,
      explicitOnly: el.memoryExplicitOnly.checked,
    },
    avatar: {
      outfit: el.avatarOutfit.value,
    },
  });
  startPresence();
  startDesktopAwareness();
  say("设置存好了。这样才像个会听话的人。", "proud");
}

async function sendMiniReply(event) {
  event.preventDefault();
  const text = el.miniInput.value.trim();
  if (!text) return;
  touchUser();
  el.miniInput.value = "";
  hideMiniReply();
  await sendText(text, { showInPanel: false });
}

async function sendChat(event) {
  event.preventDefault();
  const text = el.messageInput.value.trim();
  if (!text) return;
  touchUser();
  el.messageInput.value = "";
  await sendText(text, { showInPanel: true });
}

async function sendText(text, options = {}) {
  const userEmotion = inferEmotion(text);
  setEmotion(userEmotion, 3600);
  await applyRequestedOutfit(text);

  if (isSootheText(text)) {
    say("哼……这还差不多。我才没有一下子就被哄好。", "blush");
  }

  if (options.showInPanel) {
    appendMessage("user", text);
    appendMessage("assistant", "我想一下，别催。", true);
  }

  try {
    const result = await window.companion.sendChat(text);
    removeTyping();
    const replyEmotion = inferEmotion(result.reply || text);
    if (options.showInPanel) appendMessage("assistant", result.reply);
    say(result.reply, replyEmotion);
    speak(result.reply);
    if (result.remembered) say("这件事我记下了。想删就去记忆里找我。", "proud");
    if (result.action?.type === "reminder") say(`提醒设好了：${new Date(result.action.remindAt).toLocaleString()}。别到时赖我。`, "proud");
    if (result.action?.type === "todo") say(`待办记下了：${result.action.content}。我会盯着你的。`, "proud");
    if (result.action?.type === "launch") say(`打开了：${result.action.name}。效率不错嘛。`, "happy");
    if (result.action?.type === "launch-missing") say(`白名单里没有“${result.action.query}”。先去设置里加，别让我乱开东西。`, "pout");
    await refreshAllLists();
  } catch (error) {
    removeTyping();
    const message = `接口出错了：${error.message || error}`;
    if (options.showInPanel) appendMessage("assistant", message);
    say("API 抽风了。不是我，是它。", "angry");
  }
}

function appendMessage(role, content, typing = false) {
  const node = document.createElement("div");
  node.className = `message ${role}${typing ? " typing" : ""}`;
  node.textContent = content;
  el.messages.appendChild(node);
  el.messages.scrollTop = el.messages.scrollHeight;
}

function removeTyping() {
  el.messages.querySelector(".typing")?.remove();
}

async function refreshMessages() {
  const messages = await window.companion.listMessages();
  el.messages.innerHTML = "";
  for (const message of messages) appendMessage(message.role, message.content);
}

function say(text, emotion = "neutral") {
  bubbleQueue.push({ text: String(text), emotion });
  if (!bubbleShowing) showNextBubble();
}

function showNextBubble() {
  const next = bubbleQueue.shift();
  if (!next) {
    bubbleShowing = false;
    el.bubble.classList.add("hidden");
    setEmotion("neutral");
    scheduleWindowShape();
    return;
  }
  bubbleShowing = true;
  const cleaned = next.text.replace(/\s+/g, " ").slice(0, 120);
  setEmotion(next.emotion || inferEmotion(cleaned));
  el.bubble.textContent = cleaned;
  el.bubble.classList.remove("hidden");
  scheduleWindowShape();
  clearTimeout(bubbleTimer);
  const duration = clamp(cleaned.length * 95 + 2600, 4200, 12000);
  bubbleTimer = setTimeout(showNextBubble, duration);
}

function setEmotion(emotion = "neutral", timeout = 0) {
  clearTimeout(emotionTimer);
  el.avatarButton.dataset.emotion = emotion;
  if (timeout > 0) {
    emotionTimer = setTimeout(() => {
      el.avatarButton.dataset.emotion = "neutral";
    }, timeout);
  }
}

function setOutfit(outfit = "work") {
  el.avatarButton.dataset.outfit = outfit;
}

async function saveOutfit(outfit = "work") {
  setOutfit(outfit);
  settings = await window.companion.saveSettings({
    ...settings,
    avatar: {
      ...(settings.avatar || {}),
      outfit,
    },
  });
  el.avatarOutfit.value = outfit;
}

function inferOutfit(text) {
  const value = String(text);
  if (/水手服| sailor/i.test(value)) return "sailor";
  if (/旗袍| qipao|cheongsam/i.test(value)) return "qipao";
  if (/老师服|教师|teacher/i.test(value)) return "teacher";
  if (/泳装|泳衣|swimsuit/i.test(value)) return "swimsuit";
  if (/比基尼|bikini|沙滩装|海边装|beach/i.test(value)) return "bikini";
  if (/工作服|通勤|上班|work/i.test(value)) return "work";
  return null;
}

async function applyRequestedOutfit(text) {
  const outfit = inferOutfit(text);
  if (!outfit || outfit === settings.avatar?.outfit) return;
  await saveOutfit(outfit);
  const label = el.avatarOutfit.options[el.avatarOutfit.selectedIndex]?.textContent || "这套";
  say(`换好了，${label}。满意了吧？哼。`, "proud");
}

function inferEmotion(text) {
  const value = String(text);
  if (/喜欢|可爱|抱抱|贴贴|摸摸|哄|乖|谢谢|爱你|老婆/.test(value)) return "blush";
  if (/开心|好耶|太好了|哈哈|笑|棒|不错|赢/.test(value)) return "happy";
  if (/生气|气死|烦|讨厌|闭嘴|混蛋|笨蛋|哼|不理/.test(value)) return "angry";
  if (/难过|哭|累|崩|焦虑|害怕|撑不住|委屈/.test(value)) return "sad";
  if (/夸|厉害|完成|搞定|漂亮|效率/.test(value)) return "proud";
  if (/冷落|不理|才没有|傲娇|小脾气/.test(value)) return "pout";
  return "neutral";
}

function isSootheText(text) {
  return /哄|抱歉|对不起|乖|摸摸|抱抱|喜欢你|别生气|理你/.test(String(text));
}

function speak(text) {
  if (!settings?.voice?.enabled || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(String(text).slice(0, 260));
  utterance.lang = "zh-CN";
  utterance.rate = Number(settings.voice.rate || 1);
  utterance.pitch = Number(settings.voice.pitch || 1.08);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function startPresence() {
  clearInterval(presenceTimer);
  if (settings?.presence?.level === "off") return;
  const fallbackByLevel = {
    high: 35,
    normal: 90,
    low: 180,
  };
  const fallback = fallbackByLevel[settings?.presence?.level] || fallbackByLevel.normal;
  const interval = clamp(Number(settings?.presence?.intervalSeconds || fallback), 10, 600) * 1000;
  presenceTimer = setInterval(() => {
    if (isQuietTime()) return;
    const [line, emotion] = gentlePresenceLines[Math.floor(Math.random() * gentlePresenceLines.length)];
    say(line, emotion);
  }, interval);
}

function startIdlePout() {
  clearInterval(idlePoutTimer);
  idlePoutTimer = setInterval(() => {
    const idleMs = Date.now() - lastUserInteraction;
    if (idleMs < 4 * 60 * 1000 || isQuietTime()) return;
    const line = gentlePoutLines[Math.floor(Math.random() * gentlePoutLines.length)];
    say(line, "pout");
    lastUserInteraction = Date.now() - 2 * 60 * 1000;
  }, 30000);
}

function startDesktopAwareness() {
  clearInterval(desktopTimer);
  if (!settings?.screenAwareness?.enabled) return;
  const interval = clamp(Number(settings.screenAwareness.intervalSeconds || 75), 30, 900) * 1000;
  desktopTimer = setInterval(() => {
    if (isQuietTime()) return;
    observeDesktopNow({ silentFailure: true });
  }, interval);
}

async function observeDesktopNow(options = {}) {
  if (observing) return;
  observing = true;
  try {
    const result = await window.companion.observeDesktop();
    if (result?.reply) {
      say(result.reply, inferEmotion(result.reply));
      speak(result.reply);
      if (!el.chatPanel.classList.contains("hidden")) {
        appendMessage("assistant", `[看桌面] ${result.reply}`);
      }
    }
  } catch (error) {
    if (!options.silentFailure) say(`我看不到桌面：${error.message || error}`, "sad");
  } finally {
    observing = false;
  }
}

function isQuietTime() {
  const quiet = settings?.presence?.quietHours;
  if (!quiet?.enabled) return false;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = quiet.start.split(":").map(Number);
  const [endHour, endMinute] = quiet.end.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return start > end ? minutes >= start || minutes <= end : minutes >= start && minutes <= end;
}

function openSettings() {
  hydrateSettings();
  el.settingsPanel.classList.remove("hidden");
  refreshAllLists();
  syncWindowMode();
  scheduleWindowShape();
}

async function resetChatAndMemory() {
  if (!resetArmed) {
    armResetButtons();
    say("再点一次“确认清除”才会真的删。哼，我给你留反悔机会了。", "pout");
    return;
  }

  setResetButtonsBusy(true);
  try {
    const result = await window.companion.resetChatAndMemory();
    bubbleQueue = [];
    bubbleShowing = false;
    clearTimeout(bubbleTimer);
    el.bubble.classList.add("hidden");
    el.messages.innerHTML = "";
    el.memoryList.innerHTML = "";
    await refreshMessages();
    await refreshMemories();
    const cleared = result?.messageCount === 0 && result?.memoryCount === 0;
    say(cleared ? `清好了，删掉 ${result.deletedMessages || 0} 条聊天、${result.deletedMemories || 0} 条记忆。重新开始吧。` : "奇怪，还有东西没清干净。我会再盯一眼。", cleared ? "blush" : "angry");
  } catch (error) {
    say(`清除失败：${error.message || error}`, "angry");
  } finally {
    resetArmed = false;
    setResetButtonsBusy(false);
    setResetButtonLabels("重新开始：清除记忆和聊天记录");
  }
}

function armResetButtons() {
  resetArmed = true;
  clearTimeout(resetArmTimer);
  setResetButtonLabels("确认清除：不可撤销");
  resetArmTimer = setTimeout(() => {
    resetArmed = false;
    setResetButtonLabels("重新开始：清除记忆和聊天记录");
  }, 6000);
}

function setResetButtonLabels(label) {
  el.resetDataButton.textContent = label;
  el.resetDataButtonApi.textContent = label;
}

function setResetButtonsBusy(busy) {
  el.resetDataButton.disabled = busy;
  el.resetDataButtonApi.disabled = busy;
  if (busy) setResetButtonLabels("正在清除...");
}

function selectTab(name) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("selected", tab.dataset.tab === name));
  document.querySelectorAll(".tab-page").forEach((page) => page.classList.add("hidden"));
  document.getElementById(`tab-${name}`).classList.remove("hidden");
}

async function refreshAllLists() {
  await Promise.all([refreshMemories(), refreshTodos(), refreshReminders(), refreshLaunchItems()]);
}

async function refreshMemories() {
  const memories = await window.companion.listMemories();
  el.memoryList.innerHTML = "";
  if (!memories.length) {
    el.memoryList.textContent = "还没有长期记忆。你倒是说点值得我记的事啊。";
    return;
  }
  for (const memory of memories) {
    const item = createItem(memory.content, `重要度 ${memory.importance} · ${formatDate(memory.updated_at)}`);
    item.actions.append(
      button("改", async () => {
        const content = prompt("修改记忆", memory.content);
        if (!content) return;
        await window.companion.updateMemory({ ...memory, content });
        refreshMemories();
      }),
      button("删", async () => {
        await window.companion.deleteMemory(memory.id);
        refreshMemories();
      }),
    );
    el.memoryList.appendChild(item.node);
  }
}

async function createTodo(event) {
  event.preventDefault();
  const content = el.todoInput.value.trim();
  if (!content) return;
  await window.companion.createTodo(content);
  el.todoInput.value = "";
  refreshTodos();
}

async function refreshTodos() {
  const todos = await window.companion.listTodos();
  el.todoList.innerHTML = "";
  for (const todo of todos) {
    const item = createItem(todo.content, todo.completed ? "已完成" : "未完成");
    item.node.style.opacity = todo.completed ? "0.62" : "1";
    item.actions.append(
      button(todo.completed ? "撤销" : "完成", async () => {
        await window.companion.toggleTodo(todo.id, !todo.completed);
        refreshTodos();
      }),
      button("删", async () => {
        await window.companion.deleteTodo(todo.id);
        refreshTodos();
      }),
    );
    el.todoList.appendChild(item.node);
  }
}

async function createReminder(event) {
  event.preventDefault();
  const text = el.reminderInput.value.trim();
  if (!text) return;
  const reminder = await window.companion.createReminder(text);
  el.reminderInput.value = "";
  say(`提醒设好了：${new Date(reminder.remindAt).toLocaleString()}。别到时赖我。`, "proud");
  refreshReminders();
}

async function refreshReminders() {
  const reminders = await window.companion.listReminders();
  el.reminderList.innerHTML = "";
  for (const reminder of reminders) {
    const item = createItem(reminder.content, `${new Date(reminder.remind_at).toLocaleString()} · ${reminder.completed ? "已提醒" : "等待中"}`);
    item.actions.append(
      button("删", async () => {
        await window.companion.deleteReminder(reminder.id);
        refreshReminders();
      }),
    );
    el.reminderList.appendChild(item.node);
  }
}

async function createLaunchItem(event) {
  event.preventDefault();
  const name = el.launchName.value.trim();
  const target = el.launchTarget.value.trim();
  if (!name || !target) return;
  await window.companion.createLaunchItem({ name, target, kind: el.launchKind.value });
  el.launchName.value = "";
  el.launchTarget.value = "";
  refreshLaunchItems();
}

async function refreshLaunchItems() {
  const items = await window.companion.listLaunchItems();
  el.launchList.innerHTML = "";
  for (const launch of items) {
    const item = createItem(launch.name, launch.target);
    item.actions.append(
      button("打开", async () => {
        await window.companion.openLaunchItem(launch.id);
        say(`打开了：${launch.name}。下次也可以直接叫我。`, "happy");
      }),
      button("删", async () => {
        await window.companion.deleteLaunchItem(launch.id);
        refreshLaunchItems();
      }),
    );
    el.launchList.appendChild(item.node);
  }
}

function createItem(title, meta) {
  const node = document.createElement("div");
  node.className = "list-item";
  const text = document.createElement("div");
  text.textContent = title;
  const small = document.createElement("small");
  small.textContent = meta;
  text.appendChild(small);
  const actions = document.createElement("div");
  actions.className = "item-actions";
  node.append(text, actions);
  return { node, actions };
}

function button(label, handler) {
  const node = document.createElement("button");
  node.type = "button";
  node.textContent = label;
  node.addEventListener("click", handler);
  return node;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

init();
