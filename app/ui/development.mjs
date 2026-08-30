import { getPreferences, initializePreferences } from "/app/ui/preferences.mjs";

function translate() {
  const useEnglish = getPreferences().language === "en";
  document.querySelectorAll("[data-zh][data-en]").forEach(element => { element.textContent = useEnglish ? element.dataset.en : element.dataset.zh; });
  document.querySelectorAll("[data-zh-content][data-en-content]").forEach(element => { element.setAttribute("content", useEnglish ? element.dataset.enContent : element.dataset.zhContent); });
  document.querySelectorAll("[data-zh-aria][data-en-aria]").forEach(element => { element.setAttribute("aria-label", useEnglish ? element.dataset.enAria : element.dataset.zhAria); });
  document.title = useEnglish ? "IFC ClashTrace — Development log" : "IFC ClashTrace — 研发进程";
}

initializePreferences();
translate();
document.addEventListener("ifcclashtrace:preferences", translate);
document.documentElement.dataset.g4Ready = "true";
