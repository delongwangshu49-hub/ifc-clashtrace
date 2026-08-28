const STORAGE_KEY = "ifc-clashtrace.preferences.v1";

const defaults = Object.freeze({
  style: "mainstream",
  language: "zh-CN",
  theme: "dark",
  aiEnabled: false,
});

const messages = {
  "zh-CN": {
    "pref.group": "显示与 AI 偏好",
    "pref.style": "风格",
    "pref.style.mainstream": "大众体验",
    "pref.style.minimal": "工程极简",
    "pref.language": "语言",
    "pref.language.zh": "简体中文",
    "pref.language.en": "English",
    "pref.theme": "外观",
    "pref.theme.light": "亮色",
    "pref.theme.dark": "暗色",
    "pref.ai": "AI 解读",
    "pref.ai.off": "关闭",
    "pref.ai.on": "开启",
    "home.nav.capabilities": "能力",
    "home.nav.evidence": "证据",
    "home.nav.boundaries": "适用范围",
    "home.nav.label": "主要导航",
    "home.actions.label": "主要入口",
    "home.brandMark.aria": "墙体、管线、碰撞环与检查提示气泡组成的 IFC ClashTrace 标志",
    "home.assurance.label": "产品保证",
    "home.eyebrow": "确定性 BIM 审阅",
    "home.statement.lead": "让每一次管线—结构冲突，",
    "home.statement.detail": "都能追溯到模型、构件与计算证据。",
    "home.copy.lead": "两份 IFC4 始终留在本机，完成硬碰撞与 50 mm 净距检查。",
    "home.copy.detail": "从结论定位到双方构件；证据不足时明确标记 NOT_EVALUATED。",
    "home.launch": "立即使用",
    "home.development": "研发进程",
    "home.local": "IFC 文件不离开浏览器",
    "home.deterministic": "确定性结果始终权威",
    "home.failClosed": "失败关闭，不猜测结论",
    "home.trace.aria": "从管线穿墙到证据记录的示意",
    "home.trace.a": "A · 管线",
    "home.trace.b": "B · 结构",
    "home.trace.kicker": "冲突记录 · C01",
    "home.trace.status": "硬碰撞 · CLASH",
    "home.trace.rule": "规则",
    "home.trace.tolerance": "容差",
    "home.trace.identity": "构件身份",
    "home.section.core.title": "从两份 IFC，\n到可定位的冲突结果。",
    "home.section.core.copy": "选择受控案例，或分别载入管线模型与结构模型。IFC ClashTrace 在浏览器内运行已冻结的硬碰撞与 50 mm 净距规则，统一汇总碰撞、预警、净空和未评估结果。点击任一结果，即可在真实 IFC 三维视图中聚焦双方构件，并继续查看判定依据。",
    "home.section.evidence.title": "每一条结论，\n都能回到模型与计算依据。",
    "home.section.evidence.copy": "结果不仅显示碰撞或净距状态，还保留规则 ID、双方 GUID 与类型、容差、测得净距、模型 SHA-256、可靠性证书和诊断说明。项目成员可以沿同一条记录复核输入、对象与规则；AI 解读默认关闭，即使开启也只解释这些既有字段，不能重写确定性结果。",
    "home.section.boundary.title": "明确计算条件，\n让结果可以放心复核。",
    "home.section.boundary.copy": "当前版本专注于桌面 Chrome 中的 IFC4 米制协调：管线模型与墙/梁结构模型使用共享项目坐标，并由已验证的几何族完成判定。输入缺失、坐标未确认或几何证据不足时，系统会明确说明原因并标记为 NOT_EVALUATED，让团队清楚知道哪些结论已经成立、哪些仍需补充信息。",
    "home.showcase.title": "从计算到复核，\n让每一步都有证据。",
    "home.showcase.copy": "三类工作被收进同一条清晰路径；把鼠标移到模块上，可查看对应的真实页面预览。",
    "home.feature.modes.kicker": "DISPLAY MODES",
    "home.feature.modes.title": "切换显示，\n工作不断。",
    "home.feature.modes.copy": "大众体验或工程极简、中文或英语、亮色或暗色；偏好只保存在本机。",
    "home.feature.modes.previewAria": "两种主页显示模式预览",
    "home.feature.modes.lightAlt": "亮色中文大众体验主页",
    "home.feature.modes.darkAlt": "暗色英文工程极简主页",
    "home.feature.modes.lightCaption": "亮色 · 中文 · 大众体验",
    "home.feature.modes.darkCaption": "暗色 · English · 工程极简",
    "home.feature.review.kicker": "DETERMINISTIC REVIEW",
    "home.feature.review.title": "计算、定位、复核，\n一条记录走到底。",
    "home.feature.review.copy": "载入两份 IFC4，运行硬碰撞与净距规则，在 3D 中聚焦双方构件并打开完整证据。",
    "home.feature.review.previewAria": "确定性功能工作台预览",
    "home.feature.review.alt": "暗色英文确定性功能工作台",
    "home.feature.review.caption": "真实结果 · 构件定位 · 证据抽屉",
    "home.feature.open.kicker": "OPEN EVIDENCE",
    "home.feature.open.title": "研发过程公开，\n方法与边界可追溯。",
    "home.feature.open.copy": "公开记录 Gate、测试、失败关闭边界与许可证；代码采用 MIT，生成数据采用 CC0。",
    "home.feature.open.previewAria": "研发历程与公开证据页面预览",
    "home.feature.open.alt": "亮色中文研发历程页面",
    "home.feature.open.caption": "研发历程 · 测试证据 · 开源许可",
    "home.footer.note": "模型仅在浏览器本地处理 · 确定性证据全程可追溯",
    "home.footer.tagline": "公开构建的确定性 IFC 证据。",
    "home.footer.navLabel": "页脚导航",
    "home.footer.codeLicense": "MIT 代码许可",
    "home.footer.dataLicense": "数据与许可",
    "common.skip": "跳到主要内容",
    "common.home": "首页",
    "common.brandHome": "IFC ClashTrace 首页",
    "common.openNew": "在新标签页打开",
    "common.localProcessing": "浏览器本地处理",
    "common.notCertified": "非认证工程审查",
  },
  en: {
    "pref.group": "Display and AI preferences",
    "pref.style": "Style",
    "pref.style.mainstream": "Popular experience",
    "pref.style.minimal": "Engineering minimal",
    "pref.language": "Language",
    "pref.language.zh": "简体中文",
    "pref.language.en": "English",
    "pref.theme": "Appearance",
    "pref.theme.light": "Light",
    "pref.theme.dark": "Dark",
    "pref.ai": "AI interpretation",
    "pref.ai.off": "Off",
    "pref.ai.on": "On",
    "home.nav.capabilities": "Capabilities",
    "home.nav.evidence": "Evidence",
    "home.nav.boundaries": "Scope",
    "home.nav.label": "Primary navigation",
    "home.actions.label": "Primary destinations",
    "home.brandMark.aria": "IFC ClashTrace mark formed by a wall, pipe, clash ring, and review callout",
    "home.assurance.label": "Product assurances",
    "home.eyebrow": "DETERMINISTIC BIM REVIEW",
    "home.statement.lead": "Trace every pipe–structure conflict",
    "home.statement.detail": "back to the model and evidence.",
    "home.copy.lead": "Run hard-clash and 50 mm clearance checks locally.",
    "home.copy.detail": "Inspect both elements—or fail closed when evidence is incomplete.",
    "home.launch": "Launch app",
    "home.development": "Development log",
    "home.local": "IFC files stay in the browser",
    "home.deterministic": "Deterministic results stay authoritative",
    "home.failClosed": "Fail closed; never guess",
    "home.trace.aria": "Illustration tracing a pipe through a wall into an evidence record",
    "home.trace.a": "A · MEP",
    "home.trace.b": "B · STRUCTURE",
    "home.trace.kicker": "CLASH RECORD · C01",
    "home.trace.status": "Hard clash · CLASH",
    "home.trace.rule": "RULE",
    "home.trace.tolerance": "TOLERANCE",
    "home.trace.identity": "IDENTITY",
    "home.section.core.title": "From two IFC models,\nto a conflict you can locate.",
    "home.section.core.copy": "Choose a controlled case or load separate MEP and structure models. IFC ClashTrace runs the frozen hard-clash and 50 mm clearance rules in the browser, bringing clashes, warnings, clearances, and unevaluated outcomes into one review. Select any result to focus both components in the real IFC 3D view and continue into the decision evidence.",
    "home.section.evidence.title": "Every conclusion,\nbacked by traceable evidence.",
    "home.section.evidence.copy": "A result carries more than a clash or clearance label: it preserves the rule ID, both GUIDs and types, tolerance, measured clearance, model SHA-256 values, reliability certificate, and diagnostics. Teammates can retrace the same input, objects, and rule. AI interpretation defaults off; when enabled, it can explain only these existing fields and cannot rewrite the deterministic result.",
    "home.section.boundary.title": "Clear computation conditions.\nResults the team can trust and review.",
    "home.section.boundary.copy": "This version focuses on metre-based IFC4 coordination in desktop Chrome. MEP and wall/beam structure models use shared project coordinates and are evaluated through verified geometry families. If an input is missing, coordinates are unconfirmed, or geometric evidence is insufficient, the interface explains why and marks NOT_EVALUATED—so the team knows what is established and what still needs information.",
    "home.showcase.title": "Compute. Review. Trace.\nOne product surface.",
    "home.showcase.copy": "Three jobs, one clear path. Hover a module to preview the real interface behind it.",
    "home.feature.modes.kicker": "DISPLAY MODES",
    "home.feature.modes.title": "Switch views.\nKeep working.",
    "home.feature.modes.copy": "Popular or engineering, Chinese or English, light or dark. Preferences stay on this device.",
    "home.feature.modes.previewAria": "Two homepage display-mode previews",
    "home.feature.modes.lightAlt": "Light Chinese Popular experience homepage",
    "home.feature.modes.darkAlt": "Dark English Engineering minimal homepage",
    "home.feature.modes.lightCaption": "Light · 中文 · Popular",
    "home.feature.modes.darkCaption": "Dark · English · Engineering",
    "home.feature.review.kicker": "DETERMINISTIC REVIEW",
    "home.feature.review.title": "Compute. Locate.\nVerify.",
    "home.feature.review.copy": "Load two IFC4 files, run both rules, focus the pair in 3D, then open the evidence.",
    "home.feature.review.previewAria": "Deterministic workspace preview",
    "home.feature.review.alt": "Dark English deterministic review workspace",
    "home.feature.review.caption": "Results · 3D focus · Evidence",
    "home.feature.open.kicker": "OPEN EVIDENCE",
    "home.feature.open.title": "Built in public.\nFully traceable.",
    "home.feature.open.copy": "Gates, tests, fail-closed limits, and licenses are documented. Code is MIT; generated data is CC0.",
    "home.feature.open.previewAria": "Development history and public evidence preview",
    "home.feature.open.alt": "Light Chinese development history page",
    "home.feature.open.caption": "History · Tests · Open licenses",
    "home.footer.note": "Models stay in the local browser · Deterministic evidence remains traceable",
    "home.footer.tagline": "Deterministic IFC evidence, built in public.",
    "home.footer.navLabel": "Footer navigation",
    "home.footer.codeLicense": "MIT code license",
    "home.footer.dataLicense": "Data and licenses",
    "common.skip": "Skip to main content",
    "common.home": "Home",
    "common.brandHome": "IFC ClashTrace home",
    "common.openNew": "Opens in a new tab",
    "common.localProcessing": "Local browser processing",
    "common.notCertified": "Not certified engineering review",
  },
};

let preferences = loadPreferences();
let preferenceMountIndex = 0;

function loadPreferences() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      style: ["mainstream", "minimal"].includes(value.style) ? value.style : defaults.style,
      language: ["zh-CN", "en"].includes(value.language) ? value.language : defaults.language,
      theme: ["light", "dark"].includes(value.theme) ? value.theme : defaults.theme,
      aiEnabled: value.aiEnabled === true,
    };
  } catch {
    return { ...defaults };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function getPreferences() {
  return { ...preferences };
}

export function t(key, params = {}) {
  const template = messages[preferences.language]?.[key] ?? messages.en[key] ?? key;
  return Object.entries(params).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), template);
}

export function translatePage(root = document) {
  document.documentElement.lang = preferences.language;
  root.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-title]").forEach(element => {
    element.title = t(element.dataset.i18nTitle);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
  root.querySelectorAll("[data-i18n-alt]").forEach(element => {
    element.setAttribute("alt", t(element.dataset.i18nAlt));
  });
}

function applyPreferences() {
  document.documentElement.dataset.style = preferences.style;
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.dataset.ai = preferences.aiEnabled ? "on" : "off";
  document.documentElement.style.colorScheme = preferences.theme;
  translatePage();
  document.dispatchEvent(new CustomEvent("ifcclashtrace:preferences", { detail: getPreferences() }));
}

function updatePreference(name, value) {
  preferences = { ...preferences, [name]: value };
  persist();
  applyPreferences();
  refreshPreferenceControls();
}

function refreshPreferenceControls() {
  document.querySelectorAll(".preferences").forEach(group => {
    group.setAttribute("aria-label", t("pref.group"));
    const definitions = {
      style: { label: "pref.style", value: preferences.style, options: { mainstream: "pref.style.mainstream", minimal: "pref.style.minimal" } },
      language: { label: "pref.language", value: preferences.language, options: { "zh-CN": "pref.language.zh", en: "pref.language.en" } },
      theme: { label: "pref.theme", value: preferences.theme, options: { light: "pref.theme.light", dark: "pref.theme.dark" } },
    };
    Object.entries(definitions).forEach(([name, definition]) => {
      const dropdown = group.querySelector(`.preference-select[data-preference="${name}"]`);
      if (!dropdown) return;
      group.querySelector(`[data-preference-label="${name}"]`).textContent = t(definition.label);
      dropdown.querySelector(".preference-value").textContent = t(definition.options[definition.value]);
      dropdown.querySelectorAll('[role="option"]').forEach(option => {
        option.textContent = t(definition.options[option.dataset.value]);
        option.setAttribute("aria-selected", String(option.dataset.value === definition.value));
      });
    });
    const toggle = group.querySelector(".preference-toggle");
    if (toggle) {
      toggle.querySelector(".preference-toggle-label").textContent = t("pref.ai");
      toggle.querySelector('input[data-preference="aiEnabled"]').checked = preferences.aiEnabled;
      toggle.querySelector("strong").textContent = t(preferences.aiEnabled ? "pref.ai.on" : "pref.ai.off");
    }
  });
}

export function renderPreferenceControls() {
  document.querySelectorAll(".preferences-mount").forEach(mount => {
    mount.innerHTML = "";
    preferenceMountIndex += 1;
    const idPrefix = `preferences-${preferenceMountIndex}`;
    const group = document.createElement("div");
    group.className = "preferences";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", t("pref.group"));
    const controlMode = mount.dataset.controlMode || "display";
    const showDisplayControls = controlMode === "display";
    const showAiControl = controlMode === "ai";
    group.classList.add(`preferences-${controlMode}`);
    group.innerHTML = `
      ${showDisplayControls ? renderDropdown("style", "pref.style", { mainstream: "pref.style.mainstream", minimal: "pref.style.minimal" }, idPrefix) : ""}
      ${showDisplayControls ? renderDropdown("language", "pref.language", { "zh-CN": "pref.language.zh", en: "pref.language.en" }, idPrefix) : ""}
      ${showDisplayControls ? renderDropdown("theme", "pref.theme", { light: "pref.theme.light", dark: "pref.theme.dark" }, idPrefix) : ""}
      ${showAiControl ? `<label class="preference-toggle">
        <span class="preference-toggle-label">${t("pref.ai")}</span>
        <input type="checkbox" data-preference="aiEnabled" ${preferences.aiEnabled ? "checked" : ""}>
        <span class="toggle-track" aria-hidden="true"><span class="toggle-knob"></span><strong>${t(preferences.aiEnabled ? "pref.ai.on" : "pref.ai.off")}</strong></span>
      </label>` : ""}
    `;
    group.querySelectorAll(".preference-select").forEach(dropdown => wireDropdown(dropdown));
    group.querySelector('input[data-preference="aiEnabled"]')?.addEventListener("change", event => updatePreference("aiEnabled", event.currentTarget.checked));
    mount.append(group);
  });
  refreshPreferenceControls();
}

function renderDropdown(name, labelKey, options, idPrefix) {
  const labelId = `${idPrefix}-${name}-label`;
  const valueId = `${idPrefix}-${name}-value`;
  return `
    <div class="preference-field">
      <span id="${labelId}" data-preference-label="${name}">${t(labelKey)}</span>
      <div class="preference-select" data-preference="${name}">
        <button class="preference-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${labelId} ${valueId}">
          <span class="preference-value" id="${valueId}">${t(options[preferences[name]])}</span>
          <span class="preference-chevron" aria-hidden="true"></span>
        </button>
        <div class="preference-menu" role="listbox" aria-labelledby="${labelId}" hidden>
          ${Object.entries(options).map(([value, key]) => `<button type="button" role="option" data-value="${value}" aria-selected="${value === preferences[name]}">${t(key)}</button>`).join("")}
        </div>
      </div>
    </div>`;
}

function closeDropdown(dropdown, returnFocus = false) {
  dropdown.querySelector(".preference-menu").hidden = true;
  dropdown.querySelector(".preference-trigger").setAttribute("aria-expanded", "false");
  if (returnFocus) dropdown.querySelector(".preference-trigger").focus();
}

function openDropdown(dropdown, focusSelected = false) {
  document.querySelectorAll(".preference-select").forEach(candidate => {
    if (candidate !== dropdown) closeDropdown(candidate);
  });
  dropdown.querySelector(".preference-menu").hidden = false;
  dropdown.querySelector(".preference-trigger").setAttribute("aria-expanded", "true");
  if (focusSelected) dropdown.querySelector('[role="option"][aria-selected="true"]')?.focus();
}

function wireDropdown(dropdown) {
  const trigger = dropdown.querySelector(".preference-trigger");
  const menu = dropdown.querySelector(".preference-menu");
  const options = [...menu.querySelectorAll('[role="option"]')];
  trigger.addEventListener("click", () => menu.hidden ? openDropdown(dropdown) : closeDropdown(dropdown));
  trigger.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    openDropdown(dropdown, true);
    if (event.key === "Home") options[0].focus();
    if (event.key === "End") options.at(-1).focus();
  });
  options.forEach(option => option.addEventListener("click", () => {
    closeDropdown(dropdown, true);
    updatePreference(dropdown.dataset.preference, option.dataset.value);
  }));
  menu.addEventListener("keydown", event => {
    const current = options.indexOf(document.activeElement);
    if (["Enter", " "].includes(event.key) && current >= 0) {
      event.preventDefault();
      closeDropdown(dropdown, true);
      updatePreference(dropdown.dataset.preference, options[current].dataset.value);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
      closeDropdown(dropdown, event.key === "Escape");
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 :
      (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    options[next].focus();
  });
  document.addEventListener("click", event => {
    if (!dropdown.contains(event.target)) closeDropdown(dropdown);
  });
}

export function initializePreferences() {
  applyPreferences();
  renderPreferenceControls();
}
