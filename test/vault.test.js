import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createVault, safeFileName } from "../src/vault.js";

describe("safeFileName", () => {
  it("keeps a normal screenshot name", () => {
    assert.equal(safeFileName("CleanShot 2026-09-04 at 14.31.46.png"), "CleanShot 2026-09-04 at 14.31.46.png");
  });

  it("strips path separators", () => {
    assert.equal(safeFileName("a/b\\c.png"), "a-b-c.png");
  });
});

describe("createVault", () => {
  let root;
  let vault;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "bluesurf-vault-"));
    vault = createVault({ root, ticketsDir: "RLand/Tickets", sprintsDir: "RLand/Sprints" });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes ticket data to detail.md inside the ticket folder", async () => {
    const notePath = await vault.writeNote("RLD-339", "# RLD-339 — Example\n");
    assert.equal(notePath, path.join(root, "RLand/Tickets/RLD-339/detail.md"));
    assert.equal(await readFile(notePath, "utf8"), "# RLD-339 — Example\n");
  });

  it("writes attachment bytes into the attachments folder", async () => {
    const filePath = await vault.writeAttachment("RLD-339", "shot.png", Buffer.from("png"));
    assert.equal(filePath, path.join(root, "RLand/Tickets/RLD-339/attachments/shot.png"));
    assert.equal(await readFile(filePath, "utf8"), "png");
  });

  it("removes the whole ticket folder when the ticket is complete", async () => {
    await vault.writeNote("RLD-339", "# RLD-339 — Example\n");
    await vault.writeAttachment("RLD-339", "shot.png", Buffer.from("png"));
    const removed = await vault.removeTicket("RLD-339");
    assert.equal(removed, path.join(root, "RLand/Tickets/RLD-339"));
    await assert.rejects(() => access(removed), { code: "ENOENT" });
  });

  it("writes a sprint note under RLand/Sprints by date", async () => {
    const notePath = await vault.writeSprint("2026-09-09", "# Sprint 14 — 2026-09-09\n");
    assert.equal(notePath, path.join(root, "RLand/Sprints/2026-09-09.md"));
    assert.equal(await readFile(notePath, "utf8"), "# Sprint 14 — 2026-09-09\n");
  });

  it("rewrites the existing sprint note when that sprint was already captured", async () => {
    await vault.writeSprint("2026-09-09", "# Sprint 14 — 2026-09-09\n");
    const notePath = await vault.writeSprint("2026-09-14", "# Sprint 14 — 2026-09-14\nupdated\n", {
      sprint: "Sprint 14",
    });
    assert.equal(notePath, path.join(root, "RLand/Sprints/2026-09-09.md"));
    assert.equal(await readFile(notePath, "utf8"), "# Sprint 14 — 2026-09-14\nupdated\n");
    await assert.rejects(() => access(path.join(root, "RLand/Sprints/2026-09-14.md")), {
      code: "ENOENT",
    });
  });
});
