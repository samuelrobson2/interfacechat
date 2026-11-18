/**
 * Replays the user journeys in journeys.json through the real app and model,
 * and checks each turn against what it should produce. The rules are written
 * as principles; this is how we know they hold across situations.
 *
 *   npm run dev                       (in another terminal)
 *   npm run journeys                  (all)   ·   npm run journeys -- "Dinner"   (one, by name)
 *
 * Needs playwright-core (not a project dependency): set PLAYWRIGHT_CORE to its
 * folder, or install it. It drives an installed Chrome: CHROME_PATH, or the
 * default macOS location. JOURNEYS_URL sets the app (default localhost:3000).
 */
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

let chromium;
try {
  ({ chromium } = require(process.env.PLAYWRIGHT_CORE || "playwright-core"));
} catch {
  console.error("playwright-core not found: set PLAYWRIGHT_CORE to its folder, or install it.");
  process.exit(2);
}

const BASE = process.env.JOURNEYS_URL || "http://localhost:3000";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WAIT = Number(process.env.JOURNEYS_WAIT_MS || 45000);
const { journeys } = JSON.parse(readFileSync(join(__dirname, "journeys.json"), "utf8"));
const only = process.argv[2];

/** One request and its reply: what the model was given and what it called. */
function readTurn(body, stream) {
  const called = [...new Set([...stream.matchAll(/"toolName":"([a-z_]+)"/g)].map((m) => m[1]))];
  const opened = [...stream.matchAll(/"toolName":"open_interface"[^\n]*?"opensAs":"([a-z]+)"/g)].map((m) => m[1]);
  const filled = called.filter((name) => name.startsWith("fill_")).map((name) => name.slice(5));
  // What the model said, from the streamed text deltas.
  const said = [...stream.matchAll(/"type":"text-delta"[^\n]*?"delta":"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)).join("");
  return {
    said,
    called,
    made: [...new Set([...opened, ...filled])],
    inContext: [...(body.artefact ? [body.artefact.label ?? body.artefact.kind] : []), ...(body.open ?? []).map((entry) => entry.label)].map(String),
    tracked: (body.tracked ?? []).map((entry) => entry.label),
  };
}

async function notesOf(page) {
  return page.evaluate(() => {
    const body = document.querySelector('section[aria-label="Notes"] [data-shell-part="body"]');
    return body ? body.innerText.split("\n").map((line) => line.trim()).filter(Boolean) : [];
  });
}

/** Every way the turn falls short of what it should produce. */
function check(expect = {}, turn, notes) {
  const fail = [];
  const has = (list, item) => list.some((value) => value.toLowerCase() === item.toLowerCase());
  for (const kind of expect.made ?? []) if (!has(turn.made, kind)) fail.push(`didn't make a ${kind} (made: ${turn.made.join(", ") || "nothing"})`);
  for (const kind of expect.madeOrHas ?? []) if (!has(turn.made, kind) && !turn.inContext.some((label) => label.toLowerCase() === kind)) fail.push(`no ${kind} made or in context`);
  if (expect.calledAny && !expect.calledAny.some((name) => turn.called.includes(name))) fail.push(`called none of ${expect.calledAny.join(", ")} (called: ${turn.called.join(", ") || "nothing"})`);
  for (const name of expect.notCalled ?? []) if (turn.called.includes(name)) fail.push(`called ${name}`);
  for (const label of expect.inContext ?? []) if (!has(turn.inContext, label)) fail.push(`${label} not in context (in context: ${turn.inContext.join(", ") || "nothing"})`);
  for (const label of expect.notInContext ?? []) if (has(turn.inContext, label)) fail.push(`${label} still in context`);
  for (const label of expect.tracked ?? []) if (!has(turn.tracked, label)) fail.push(`${label} not tracked`);
  for (const pattern of expect.notes ?? []) if (!notes.some((line) => new RegExp(pattern, "i").test(line))) fail.push(`notes have no line like /${pattern}/`);
  for (const pattern of expect.notNotes ?? []) if (notes.some((line) => new RegExp(pattern, "i").test(line))) fail.push(`notes still have /${pattern}/`);
  return fail;
}

async function act(page, step) {
  const [verb, kind] = step.split(" ");
  if (!(await page.getByRole("button", { name: new RegExp(`^(Minimize|Close) ${kind}`) }).count())) {
    const pin = page.getByRole("button", { name: new RegExp(`Pin this ${kind}`) });
    if (await pin.count()) await pin.first().click();
    await page.waitForTimeout(1200);
  }
  const button = page.getByRole("button", { name: new RegExp(`^${verb === "close" ? "Close" : "Minimize"} ${kind}`) });
  if (!(await button.count())) return `couldn't ${verb} the ${kind}: it has no window`;
  await button.first().click();
  await page.waitForTimeout(800);
  return null;
}

async function run(journey, browser) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  let last = null;
  page.on("response", async (response) => {
    if (!response.url().endsWith("/api/chat-lab") || response.request().method() !== "POST") return;
    try {
      last = readTurn(JSON.parse(response.request().postData()), await response.text());
    } catch {}
  });
  const report = [];
  const record = async (say, expect, extra = []) => {
    const notes = await notesOf(page);
    const turn = last ?? { said: "", called: [], made: [], inContext: [], tracked: [] };
    report.push({ say, fail: [...extra, ...check(expect, turn, notes)], turn, notes });
    last = null;
  };

  await page.goto(`${BASE}/app/chat-lab`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const box = page.locator('textarea, [contenteditable="true"]').first();
  await box.click();
  await box.pressSequentially(journey.start, { delay: 4 });
  await page.waitForTimeout(3000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(WAIT);
  await record(journey.start, journey.expect);

  for (const step of journey.turns) {
    const problem = step.do ? await act(page, step.do) : null;
    const input = page.getByPlaceholder("How can we help you?");
    await input.focus();
    await input.pressSequentially(step.say, { delay: 4 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(WAIT);
    await record(step.say, step.expect, problem ? [problem] : []);
  }
  await page.close();
  return { name: journey.name, report, errors };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  let failures = 0;
  for (const journey of journeys.filter((entry) => !only || entry.name.toLowerCase().includes(only.toLowerCase()))) {
    const { name, report, errors } = await run(journey, browser);
    console.log(`\n${name}`);
    for (const { say, fail, turn, notes } of report) {
      failures += fail.length;
      console.log(`  ${fail.length ? "✗" : "✓"} ${say.slice(0, 70)}`);
      console.log(`      called: ${turn.called.join(", ") || "nothing"} · in context: ${turn.inContext.join(", ") || "nothing"}`);
      for (const line of fail) console.log(`      ✗ ${line}`);
      if (fail.length && turn.said) console.log(`      replied: ${turn.said.replace(/\s+/g, " ").slice(0, 400)}`);
      if (fail.length) console.log(`      notes: ${notes.join(" / ")}`);
    }
    for (const error of errors) console.log(`  page error: ${error}`);
  }
  await browser.close();
  console.log(failures ? `\n${failures} expectation(s) not met` : "\nEvery expectation met");
  process.exit(failures ? 1 : 0);
})();
