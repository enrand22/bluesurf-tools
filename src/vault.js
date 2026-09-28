import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseTicketKey } from "./model.js";

export function safeFileName(name) {
  const trimmed = String(name ?? "").trim() || "attachment";
  return trimmed.replace(/[/\\]/g, "-").replace(/^\.+$/, "attachment");
}

export function createVault({
  root,
  ticketsDir = "RLand/Tickets",
  sprintsDir = "RLand/Sprints",
} = {}) {
  if (!root) {
    throw new Error("createVault requires a vault root");
  }

  function ticketsRoot() {
    return path.join(root, ticketsDir);
  }

  function ticketDir(code) {
    parseTicketKey(code);
    return path.join(ticketsRoot(), code);
  }

  function notePath(code) {
    return path.join(ticketDir(code), "detail.md");
  }

  function attachmentDir(code) {
    return path.join(ticketDir(code), "attachments");
  }

  return {
    ticketsDir,
    ticketDir,
    notePath,
    attachmentDir,
    async writeNote(code, markdown) {
      const dest = notePath(code);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, markdown);
      return dest;
    },
    async writeAttachment(code, name, bytes) {
      const dest = path.join(attachmentDir(code), safeFileName(name));
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, bytes);
      return dest;
    },
    sprintPath(date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`Invalid sprint date: ${date}`);
      }
      return path.join(root, sprintsDir, `${date}.md`);
    },
    async findSprintPath(sprintName) {
      if (!sprintName) return null;
      const dir = path.join(root, sprintsDir);
      let names;
      try {
        names = await readdir(dir);
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
      const prefix = `# ${sprintName} —`;
      for (const name of names) {
        if (!name.endsWith(".md")) continue;
        const dest = path.join(dir, name);
        const firstLine = (await readFile(dest, "utf8")).split("\n")[0] ?? "";
        if (firstLine.startsWith(prefix)) return dest;
      }
      return null;
    },
    async writeSprint(date, markdown, { sprint } = {}) {
      const dest = (await this.findSprintPath(sprint)) ?? this.sprintPath(date);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, markdown);
      return dest;
    },
    async removeTicket(code) {
      const dir = ticketDir(code);
      const legacyNote = path.join(ticketsRoot(), `${code}.md`);
      await rm(dir, { recursive: true, force: true });
      await rm(legacyNote, { force: true });
      return dir;
    },
  };
}
