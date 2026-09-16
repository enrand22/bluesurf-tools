import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createVault } from "../src/vault.js";
import { exportTicket } from "../src/export-ticket.js";

describe("exportTicket", () => {
  let root;
  let vault;

  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "bluesurf-export-"));
    vault = createVault({ root, ticketsDir: "RLand/Tickets" });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("writes the note and downloaded files for a ticket", async () => {
    const client = {
      async getTicketNote(code) {
        assert.equal(code, "RLD-339");
        return "# RLD-339 — Attachments\n";
      },
      async listWorkItemFiles(code) {
        assert.equal(code, "RLD-339");
        return [
          { id: "file-1", workItemId: "item-1", name: "shot.png" },
          { id: "file-2", workItemId: "item-1", name: "loop.gif" },
        ];
      },
      async downloadWorkItemFile(workItemId, fileId) {
        return Buffer.from(`${workItemId}:${fileId}`);
      },
    };

    const result = await exportTicket({ client, vault, code: "RLD-339" });
    assert.equal(result.notePath, path.join(root, "RLand/Tickets/RLD-339/detail.md"));
    assert.equal(await readFile(result.notePath, "utf8"), "# RLD-339 — Attachments\n");
    assert.deepEqual(
      result.attachments.map((file) => path.basename(file)),
      ["shot.png", "loop.gif"],
    );
    assert.equal(await readFile(result.attachments[0], "utf8"), "item-1:file-1");
  });
});
