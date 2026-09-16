import { parseTicketKey } from "./model.js";

export async function exportTicket({ client, vault, code }) {
  parseTicketKey(code);
  const note = await client.getTicketNote(code);
  const files = await client.listWorkItemFiles(code);
  const attachments = [];
  for (const file of files) {
    const bytes = await client.downloadWorkItemFile(file.workItemId, file.id);
    attachments.push(await vault.writeAttachment(code, file.name, bytes));
  }
  const notePath = await vault.writeNote(code, note);
  return { notePath, attachments };
}
