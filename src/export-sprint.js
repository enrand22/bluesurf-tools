import { toSprintNote } from "./model.js";

export function todayStamp(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function exportSprint({ client, vault, projectCode, date }) {
  const rows = await client.listMyCurrentSprintRows(projectCode);
  const notePath = await vault.writeSprint(date, toSprintNote(rows, { date }), {
    sprint: rows[0]?.sprint,
  });
  return { notePath, rows };
}
