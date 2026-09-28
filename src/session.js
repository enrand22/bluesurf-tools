import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "./client.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function profileDir() {
  return path.join(root, ".chrome-profile");
}

// The SPA takes 1.5–7s after load to restore the session (measured on a warm
// profile), so a 10s budget failed intermittently with a false "expired".
const WARM_TIMEOUT_MS = 30_000;

async function warmSession(context, origin, timeoutMs = WARM_TIMEOUT_MS) {
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await context.request.get(`${origin}/api/instance/currentUser`, {
      headers: { Accept: "application/json" },
    });
    if (response.ok()) return;
    await page.waitForTimeout(250);
  }
  const seconds = Math.round(timeoutMs / 1000);
  const error = new Error(
    `Blue Surf session not ready after ${seconds}s (likely expired). Run npm run login and retry.`,
  );
  error.status = 401;
  throw error;
}

export async function createSessionRequest({
  origin = process.env.BLUESURF_ORIGIN ?? "https://surf.bluepeople.com",
  userDataDir = profileDir(),
  headless = true,
  warmTimeoutMs = Number(process.env.BLUESURF_WARM_TIMEOUT_MS) || WARM_TIMEOUT_MS,
} = {}) {
  await mkdir(userDataDir, { recursive: true });
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1400, height: 900 },
  });

  try {
    await warmSession(context, origin, warmTimeoutMs);
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
