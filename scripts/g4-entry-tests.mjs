import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function firstInlineScript(path) {
  const html = fs.readFileSync(path, "utf8");
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, `${path} must contain an inline entry bootstrap.`);
  return match[1];
}

function runBootstrap(path, { hash = "", storageThrows = false } = {}) {
  const storage = new Map();
  const events = new Map();
  const scrollCalls = [];
  const sessionStorage = {
    getItem(key) {
      if (storageThrows) throw new DOMException("blocked", "SecurityError");
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      if (storageThrows) throw new DOMException("blocked", "SecurityError");
      storage.set(key, String(value));
    },
    removeItem(key) {
      if (storageThrows) throw new DOMException("blocked", "SecurityError");
      storage.delete(key);
    },
  };
  const context = vm.createContext({
    DOMException,
    sessionStorage,
    history: { scrollRestoration: "auto" },
    location: { hash },
    addEventListener(type, callback) { events.set(type, callback); },
    scrollTo(...args) { scrollCalls.push(args); },
  });
  vm.runInContext(firstInlineScript(path), context, { filename: path });
  return { context, storage, events, scrollCalls };
}

const resetKey = "ifc-clashtrace.reset-preferences.v2";
const home = runBootstrap("index.html");
assert.equal(home.storage.get(resetKey), "true", "Every homepage load must request the default display state.");

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

console.log("G4_ENTRY_HOME_RESET=PASS");
console.log("G4_ENTRY_STORAGE_FAILURE_SAFE=PASS");
console.log("G4_ENTRY_NEW_TAB_TOP=PASS");
console.log("G4_ENTRY_HASH_NAVIGATION=PASS");
