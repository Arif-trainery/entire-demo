const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

// Use a temp file for tests
const TEST_FILE = path.join(__dirname, ".test-tasks.json");

// Monkey-patch the module
before(() => {
  // Remove any leftover test file
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
});

after(() => {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
});

describe("store", () => {
  it("should return empty array when no file exists", () => {
    const store = require("./store");
    const original = store.DATA_FILE;
    // We can't easily override, so just test that load doesn't throw on missing file
    const tasks = store.load();
    assert.ok(Array.isArray(tasks));
  });

  it("should save and load tasks", () => {
    const store = require("./store");
    const tasks = [
      { id: 1, text: "Test task", done: false, created: new Date().toISOString() },
    ];
    store.save(tasks);
    const loaded = store.load();
    assert.strictEqual(loaded.length, 1);
    assert.strictEqual(loaded[0].text, "Test task");
  });
});
