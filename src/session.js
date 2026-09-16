import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "./client.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function profileDir() {
  return path.join(root, ".chrome-profile");
}

async function warmSession(context, origin) {
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  for (let attempt = 0; attempt < 40; attempt++) {
    const response = await context.request.get(`${origin}/api/instance/currentUser`, {
      headers: { Accept: "application/json" },
    });
    if (response.ok()) return;
    await page.waitForTimeout(250);
  }
  const error = new Error("Blue Surf session expired. Run npm run login and retry.");
  error.status = 401;
  throw error;
}

export async function createSessionRequest({
  origin = process.env.BLUESURF_ORIGIN ?? "https://surf.bluepeople.com",
  userDataDir = profileDir(),
  headless = true,
} = {}) {
  await mkdir(userDataDir, { recursive: true });
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1400, height: 900 },
  });

  try {
    await warmSession(context, origin);
  } catch (error) {
    await context.close();
    throw error;
  }

  async function request(method, requestPath, body) {
    const response = await context.request.fetch(`${origin}${requestPath}`, {
      method,
      data: body === undefined ? undefined : JSON.stringify(body),
      headers:
        body === undefined
          ? { Accept: "*/*" }
          : { Accept: "application/json", "Content-Type": "application/json" },
    });
    if (!response.ok()) {
      const error = new Error(`Blue Surf ${response.status()} on ${requestPath}`);
      error.status = response.status();
      throw error;
    }
    const contentType = response.headers()["content-type"] ?? "";
    if (/application\/json/i.test(contentType)) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    if (/text\//i.test(contentType)) {
      return response.text();
    }
    return Buffer.from(await response.body());
  }

  return {
    request,
    async close() {
      await context.close();
    },
  };
}

export async function createSessionClient(options) {
  const session = await createSessionRequest(options);
  return {
    ...createClient({ request: session.request, origin: options?.origin }),
    close: session.close,
  };
}
