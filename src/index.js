#!/usr/bin/env node

const { load, save } = require("./store");

const [, , command, ...args] = process.argv;

function parseFlags(args) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p" || args[i] === "--priority") {
      flags.priority = args[++i];
    } else if (args[i] === "-t" || args[i] === "--tag") {
      flags.tags = flags.tags || [];
      flags.tags.push(args[++i]);
    } else {
      rest.push(args[i]);
    }
  }
  return { flags, text: rest.join(" ") };
}

function formatTask(t) {
  const check = t.done ? "x" : " ";
  const pri = t.priority ? ` [${t.priority.toUpperCase()}]` : "";
  const tags = t.tags?.length ? ` (${t.tags.map((g) => "#" + g).join(" ")})` : "";
  return `    [${check}] #${t.id}${pri} ${t.text}${tags}`;
}

const commands = {
  add() {
    const { flags, text } = parseFlags(args);
    if (!text) return console.log("Usage: taskflow add <text> [-p high|med|low] [-t tag]");
    const tasks = load();
    const task = {
      id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      text,
      done: false,
      priority: flags.priority || null,
      tags: flags.tags || [],
      created: new Date().toISOString(),
    };
    tasks.push(task);
    save(tasks);
    console.log(`Added task #${task.id}: ${text}`);
  },

  list() {
    const tasks = load();
    if (!tasks.length) return console.log("No tasks yet. Add one with: taskflow add <text>");

    const filter = args[0];
    let filtered = tasks;
    if (filter) {
      filtered = tasks.filter(
        (t) =>
          t.priority === filter ||
          (t.tags && t.tags.includes(filter))
      );
      if (!filtered.length) return console.log(`No tasks matching "${filter}"`);
    }

    const pending = filtered.filter((t) => !t.done);
    const done = filtered.filter((t) => t.done);
    if (pending.length) {
      console.log("\n  Pending:");
      pending.forEach((t) => console.log(formatTask(t)));
    }
    if (done.length) {
      console.log("\n  Done:");
      done.forEach((t) => console.log(formatTask(t)));
    }
    console.log(`\n  ${pending.length} pending, ${done.length} done\n`);
  },

  done() {
    const idStr = args[0];
    if (!idStr) return console.log("Usage: taskflow done <id>");
    const id = Number(idStr);
    const tasks = load();
    const task = tasks.find((t) => t.id === id);
    if (!task) return console.log(`Task #${id} not found`);
    task.done = true;
    task.completed = new Date().toISOString();
    save(tasks);
    console.log(`Completed task #${id}: ${task.text}`);
  },

  remove() {
    const idStr = args[0];
    if (!idStr) return console.log("Usage: taskflow remove <id>");
    const id = Number(idStr);
    const tasks = load();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return console.log(`Task #${id} not found`);
    const [removed] = tasks.splice(idx, 1);
    save(tasks);
    console.log(`Removed task #${id}: ${removed.text}`);
  },

  search() {
    const query = args.join(" ").toLowerCase();
    if (!query) return console.log("Usage: taskflow search <query>");
    const tasks = load();
    const matches = tasks.filter(
      (t) =>
        t.text.toLowerCase().includes(query) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
    if (!matches.length) return console.log(`No tasks matching "${query}"`);
    console.log(`\n  Found ${matches.length} task(s):`);
    matches.forEach((t) => console.log(formatTask(t)));
    console.log();
  },

  stats() {
    const tasks = load();
    if (!tasks.length) return console.log("No tasks yet.");
    const pending = tasks.filter((t) => !t.done).length;
    const done = tasks.filter((t) => t.done).length;
    const byPriority = {};
    const byTag = {};
    tasks.forEach((t) => {
      if (t.priority) byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      (t.tags || []).forEach((tag) => (byTag[tag] = (byTag[tag] || 0) + 1));
    });
    console.log(`\n  Stats:`);
    console.log(`    Total: ${tasks.length}  Pending: ${pending}  Done: ${done}`);
    if (Object.keys(byPriority).length) {
      console.log(`    By priority: ${Object.entries(byPriority).map(([k, v]) => `${k}=${v}`).join(", ")}`);
    }
    if (Object.keys(byTag).length) {
      console.log(`    By tag: ${Object.entries(byTag).map(([k, v]) => `#${k}=${v}`).join(", ")}`);
    }
    console.log();
  },

  help() {
    console.log(`
  taskflow - a CLI task manager

  Commands:
    add <text> [-p priority] [-t tag]   Add a new task
    list [filter]                        Show tasks (filter by priority or tag)
    done <id>                            Mark a task as done
    remove <id>                          Remove a task
    search <query>                       Search tasks by text or tag
    stats                                Show task statistics
    help                                 Show this help
`);
  },
};

const fn = commands[command];
if (!fn) {
  commands.help();
} else {
  fn();
}
