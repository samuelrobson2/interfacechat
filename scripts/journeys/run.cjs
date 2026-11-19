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
/** How long a turn may take, at most: a turn that makes several interfaces runs through several steps. */
const WAIT = Number(process.env.JOURNEYS_WAIT_MS || 180000);
/** After the reply has finished, time for the app to apply it (the notes, what was made). */
const SETTLE = 4000;
const { journeys } = JSON.parse(readFileSync(join(__dirname, "journeys.json"), "utf8"));
const only = process.argv[2];

/** What the model was given: the interfaces in its context, and the tracked ones. */
function readRequest(body) {
  return {
    inContext: [...(body.artefact ? [body.artefact.label ?? body.artefact.kind] : []), ...(body.open ?? []).map((entry) => entry.label)].map(String),
    tracked: (body.tracked ?? []).map((entry) => entry.label),
  };
}

/**
 * What the model did this turn, read from the thread as the app saved it (the
 * tool calls and text after the latest message), not from the network stream,
 * whose body the browser doesn't always keep. Also every interface the turn made
 * that's still empty: making one and filling another is a bug, not a choice.
 */
async function readReply(page) {
  return page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("chat-lab") ?? "null");
    const session = store?.state?.sessions?.[location.pathname.split("/").pop()];
    if (!session) return null;
    const messages = session.messages ?? [];
    const lastUser = messages.map((message) => message.role).lastIndexOf("user");
    const parts = messages.slice(lastUser + 1).filter((message) => message.role === "assistant").flatMap((message) => message.parts ?? []);
    const nameOf = (part) => (part.type === "dynamic-tool" ? part.toolName : part.type?.startsWith("tool-") ? part.type.slice(5) : null);
    const called = [...new Set(parts.map(nameOf).filter(Boolean))];
    const opened = parts.filter((part) => nameOf(part) === "open_interface").map((part) => part.output?.opensAs).filter(Boolean);
    const filled = called.filter((name) => name.startsWith("fill_")).map((name) => name.slice(5));
    const asked = parts.filter((part) => nameOf(part) === "ask").flatMap((part) => (part.input?.questions ?? []).map((question) => question.ask));
    const said = parts.filter((part) => part.type === "text").map((part) => part.text).join(" ");
    const userId = messages[lastUser]?.id;
    // Nothing in it but its title and settings: no rows, items, steps or body.
    const isEmpty = (data) =>
      Object.entries(data ?? {}).every(([key, value]) =>
        Array.isArray(value) ? value.length === 0 : typeof value === "string" ? key !== "body" || !value.trim() : value === null || typeof value !== "object" || isEmpty(value),
      );
    const empty = Object.values(session.artefacts ?? {})
      .filter((artefact) => artefact.sourceUserMessageId === userId && artefact.role !== "track")
      .filter((artefact) => (artefact.shell ? artefact.shell.kind !== "notes" && isEmpty(artefact.shell.data) : !(artefact.content ?? "").trim()))
      .map((artefact) => `${artefact.title} (${artefact.shell?.kind ?? artefact.kind})`);
    return { said, asked, called, made: [...new Set([...opened, ...filled])], empty };
  });
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
    // Shown in the reply: open it in its own window first.
    const pin = page.getByRole("button", { name: new RegExp(`(Pin this|Open this|Open in) ${kind}`, "i") });
    if (await pin.count()) await pin.first().click();
    await page.waitForTimeout(1200);
  }
  const button = page.getByRole("button", { name: new RegExp(`^${verb === "close" ? "Close" : "Minimize"} ${kind}`) });
  if (!(await button.count())) {
    const seen = await page.getByRole("button").evaluateAll((els, kind) => els.map((el) => el.getAttribute("aria-label") ?? "").filter((label) => label.toLowerCase().includes(kind)), kind);
    return `couldn't ${verb} the ${kind}: it has no window (buttons naming it: ${seen.join(" | ") || "none"})`;
  }
  await button.first().click();
  await page.waitForTimeout(800);
  return null;
}

async function run(journey, browser) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  // The turn's request, and whether it's still going: finished or failed, it's done.
  let last = null;
  let pending = 0;
  const isTurn = (request) => request.url().endsWith("/api/chat-lab") && request.method() === "POST";
  page.on("request", (request) => {
    if (!isTurn(request)) return;
    pending += 1;
    try {
      last = readRequest(JSON.parse(request.postData() ?? "{}"));
    } catch {
      last = { inContext: [], tracked: [] };
    }
  });
  page.on("requestfinished", (request) => isTurn(request) && (pending -= 1));
  page.on("requestfailed", (request) => isTurn(request) && (pending -= 1));
  // A turn is done when its reply has finished streaming, not after a fixed time: wait for it, then let the app apply it.
  const waitForTurn = async () => {
    const until = Date.now() + WAIT;
    await page.waitForTimeout(1500);
    while (Date.now() < until && (pending > 0 || !last)) await page.waitForTimeout(500);
    await page.waitForTimeout(SETTLE);
  };
  const report = [];
  const record = async (say, expect, extra = []) => {
    const notes = await notesOf(page);
    const reply = (await readReply(page)) ?? { said: "", asked: [], called: [], made: [], empty: [] };
    const turn = { ...reply, ...(last ?? { inContext: [], tracked: [] }) };
    const empty = reply.empty.map((name) => `made ${name} and left it empty`);
    report.push({ say, fail: [...extra, ...empty, ...check(expect, turn, notes)], turn, notes });
    last = null;
  };

  await page.goto(`${BASE}/app/chat-lab`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const box = page.locator('textarea, [contenteditable="true"]').first();
  await box.click();
  await box.pressSequentially(journey.start, { delay: 4 });
  await page.waitForTimeout(3000);
  await page.keyboard.press("Enter");
  await waitForTurn();
  await record(journey.start, journey.expect);

  for (const step of journey.turns) {
    const problem = step.do ? await act(page, step.do) : null;
    const input = page.getByPlaceholder("How can we help you?");
    await input.focus();
    await input.pressSequentially(step.say, { delay: 4 });
    await page.keyboard.press("Enter");
    await waitForTurn();
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
      if (fail.length && turn.asked?.length) console.log(`      asked: ${turn.asked.join(" · ")}`);
      if (fail.length) console.log(`      notes: ${notes.join(" / ")}`);
    }
    for (const error of errors) console.log(`  page error: ${error}`);
  }
  await browser.close();
  console.log(failures ? `\n${failures} expectation(s) not met` : "\nEvery expectation met");
  process.exit(failures ? 1 : 0);
})();
