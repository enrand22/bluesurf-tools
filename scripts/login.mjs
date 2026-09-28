import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const userDataDir = path.join(root, ".chrome-profile");
const origin = process.env.BLUESURF_ORIGIN ?? "https://surf.bluepeople.com";

await mkdir(userDataDir, { recursive: true });

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1400, height: 900 },
  title: "Blue Surf agent",
});

const page = context.pages()[0] ?? (await context.newPage());
await page.goto(origin, { waitUntil: "domcontentloaded" });

console.log(`
Signed-in profile: ${userDataDir}
Origin:            ${origin}

1. Complete SSO in the window that just opened.
2. Wait until you can see your Blue Surf boards / tickets.
3. Come back here and press Enter to save the session and quit.
`);

await new Promise((resolve) => {
  process.stdin.resume();
  process.stdin.once("data", resolve);
});

await context.close();
console.log("Session saved. Next: npm run sprint, or npm run ticket -- RLD-xxx");
