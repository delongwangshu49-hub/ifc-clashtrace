import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function firstInlineScript(path) {
  const html = fs.readFileSync(path, "utf8");
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, `${path} must contain an inline entry bootstrap.`);
  return match[1];
}

function runBootstrap(path, { hash = "", persisted = null, legacy = null, storageThrows = false } = {}) {
  const localValues = new Map();
  const sessionValues = new Map();
  if (persisted !== null) localValues.set("ifc-clashtrace.preferences.v3", persisted);
  if (legacy !== null) sessionValues.set("ifc-clashtrace.preferences.session.v2", legacy);
  const events = new Map();
  const scrollCalls = [];
  function storage(values) {
    return {
    getItem(key) {
      if (storageThrows) throw new DOMException("blocked", "SecurityError");
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      if (storageThrows) throw new DOMException("blocked", "SecurityError");
      values.set(key, String(value));
    },
    removeItem(key) {
      if (storageThrows) throw new DOMException("blocked", "SecurityError");
      values.delete(key);
    },
    };
  }
  const context = vm.createContext({
    DOMException,
    localStorage: storage(localValues),
    sessionStorage: storage(sessionValues),
    document: { documentElement: { lang: "", dataset: {}, style: {} } },
    history: { scrollRestoration: "auto" },
    location: { hash },
    addEventListener(type, callback) { events.set(type, callback); },
    scrollTo(...args) { scrollCalls.push(args); },
  });
  vm.runInContext(firstInlineScript(path), context, { filename: path });
  return { context, localValues, sessionValues, events, scrollCalls };
}

const home = runBootstrap("index.html");
assert.equal(home.context.document.documentElement.lang, "en", "A new visitor must start in English.");
assert.equal(home.context.document.documentElement.dataset.theme, "dark", "A new visitor must start in Dark appearance.");

const returning = runBootstrap("index.html", { persisted: JSON.stringify({ language: "zh-CN", theme: "light" }) });
assert.equal(returning.context.document.documentElement.lang, "zh-CN", "A returning visitor's language must apply before first paint.");
assert.equal(returning.context.document.documentElement.dataset.theme, "light", "A returning visitor's appearance must apply before first paint.");

const legacy = runBootstrap("index.html", { legacy: JSON.stringify({ language: "zh-CN", theme: "dark" }) });
assert.equal(legacy.context.document.documentElement.lang, "zh-CN", "An existing session preference must survive the storage migration.");

assert.doesNotThrow(() => runBootstrap("index.html", { storageThrows: true }), "Homepage must fail safely when storage is unavailable.");

for (const path of ["app/index.html", "development/index.html"]) {
  const topEntry = runBootstrap(path);
  assert.equal(topEntry.context.history.scrollRestoration, "manual", `${path} must disable scroll restoration.`);
  assert.ok(topEntry.events.has("pageshow"), `${path} must enforce top-of-page entry without a hash.`);
  topEntry.events.get("pageshow")();
  assert.deepEqual(topEntry.scrollCalls, [[0, 0]], `${path} must scroll to the top on pageshow.`);

  const anchoredEntry = runBootstrap(path, { hash: "#controlled-review" });
  assert.equal(anchoredEntry.events.has("pageshow"), false, `${path} must preserve intentional hash navigation.`);
}

console.log("G4_ENTRY_NEW_VISITOR_DEFAULTS=PASS");
console.log("G4_ENTRY_PERSISTED_FIRST_PAINT=PASS");
console.log("G4_ENTRY_LEGACY_MIGRATION=PASS");
console.log("G4_ENTRY_STORAGE_FAILURE_SAFE=PASS");
console.log("G4_ENTRY_NEW_TAB_TOP=PASS");
console.log("G4_ENTRY_HASH_NAVIGATION=PASS");
