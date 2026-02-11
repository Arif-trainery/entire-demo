#!/usr/bin/env node

const { load, save } = require("./store");

const [, , command, ...args] = process.argv;

const commands = {
  add(text) {
    if (!text) return console.log("Usage: taskflow add <task description>");
    const tasks = load();
    const task = {
      id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      text,
      done: false,
      created: new Date().toISOString(),
    };
    tasks.push(task);
    save(tasks);
    console.log(`Added task #${task.id}: ${text}`);
  },

  list() {
    const tasks = load();
    if (!tasks.length) return console.log("No tasks yet. Add one with: taskflow add <text>");
    const pending = tasks.filter((t) => !t.done);
    const done = tasks.filter((t) => t.done);
    if (pending.length) {
      console.log("\n  Pending:");
      pending.forEach((t) => console.log(`    [ ] #${t.id} ${t.text}`));
    }
    if (done.length) {
      console.log("\n  Done:");
      done.forEach((t) => console.log(`    [x] #${t.id} ${t.text}`));
    }
    console.log(`\n  ${pending.length} pending, ${done.length} done\n`);
  },

  done(idStr) {
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

  remove(idStr) {
    if (!idStr) return console.log("Usage: taskflow remove <id>");
    const id = Number(idStr);
    const tasks = load();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return console.log(`Task #${id} not found`);
    const [removed] = tasks.splice(idx, 1);
    save(tasks);
    console.log(`Removed task #${id}: ${removed.text}`);
  },

  help() {
    console.log(`
  taskflow - a simple CLI task manager

  Commands:
    add <text>    Add a new task
    list          Show all tasks
    done <id>     Mark a task as done
    remove <id>   Remove a task
    help          Show this help
`);
  },
};

const fn = commands[command];
if (!fn) {
  commands.help();
} else {
  fn(args.join(" "));
}
