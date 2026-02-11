const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".taskflow.json"
);

function load() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function save(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

module.exports = { load, save, DATA_FILE };
