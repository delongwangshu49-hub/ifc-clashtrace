import { getPreferences, initializePreferences } from "/app/ui/preferences.mjs";

function translate() {
  const useEnglish = getPreferences().language === "en";
  document.querySelectorAll("[data-zh][data-en]").forEach(element => { element.textContent = useEnglish ? element.dataset.en : element.dataset.zh; });
  document.title = useEnglish ? "IFC ClashTrace — Development log" : "IFC ClashTrace — 研发进程";
}

initializePreferences();
translate();
document.addEventListener("ifcclashtrace:preferences", translate);
document.documentElement.dataset.g4Ready = "true";
