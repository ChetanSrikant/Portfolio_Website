// Local Chrome regression checks. Reports stay in the ignored QA directory.
// CHROME_PATH and QA_ORIGIN may override the local defaults.
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
const out = "tmp/phase-8-10-qa";
await mkdir(out, { recursive: true });
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4173";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(`${tmpdir()}/portfolio-regression-`);
const chrome = spawn(process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--remote-debugging-port=9243", `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { windowsHide: true, stdio: "ignore" });
let ws;
const report = { sizes: [], links: [], errors: [], checks: {} };
try {
  let tabs;
  for (let n = 0; n < 40; n++) {
    try { tabs = await (await fetch("http://127.0.0.1:9243/json")).json(); break; } catch { await sleep(250); }
  }
  if (!tabs) throw new Error("Chrome debugging endpoint unavailable");
  ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise(resolve => ws.onopen = resolve);
  let id = 0;
  const pending = new Map();
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
    if (message.method === "Runtime.exceptionThrown") report.errors.push(message.params.exceptionDetails.text + ": " + (message.params.exceptionDetails.exception?.description || ""));
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 25000);
    pending.set(++id, message => { clearTimeout(timer); message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const run = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  };
  const size = (width, height = 900) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  const nav = async route => { await send("Page.navigate", { url: origin + route }); await sleep(2100); };
  const key = async (key, code, virtual, modifiers = 0) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: virtual, modifiers, ...(key === "Enter" ? { text: "\r" } : {}) });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: virtual, modifiers });
  };
  const shot = async name => {
    const result = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`${out}/${name}.png`, Buffer.from(result.data, "base64"));
  };
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  if (process.env.QA_DETAIL) {
    await size(1440); await nav("/#gundam-engineering"); await sleep(1200);
    await run("document.querySelector('#gundam-engineering summary').focus()");
    report.checks.noteFocus = await run("document.activeElement.outerHTML");
    await key("Enter", "Enter", 13); await sleep(150);
    report.checks.noteKeyboard = await run("document.querySelector('#gundam-engineering details').open");
    await shot("engineering-note");
    await nav("/work");
    await run("document.querySelector('button[class*=evidenceCard]').focus();document.querySelector('button[class*=evidenceCard]').click()"); await sleep(400);
    await key("ArrowRight", "ArrowRight", 39); await sleep(400);
    await key("Escape", "Escape", 27); await sleep(400);
    report.checks.mediaRestoresTriggerAfterNext = await run("document.activeElement.className.includes('evidenceCard')");
    await nav("/projects");
    await run("document.querySelector('article[role=button]').focus()"); await key("Enter", "Enter", 13); await sleep(400);
    report.checks.projectTabs = [];
    for (let n = 0; n < 8; n++) { await key("Tab", "Tab", 9, n % 2 ? 8 : 0); report.checks.projectTabs.push(await run("!!document.activeElement.closest('[role=dialog]')")); }
    await key("Escape", "Escape", 27); await sleep(400);
    report.checks.projectRestoresTrigger = await run("document.activeElement.matches('article[role=button]')");
    await nav("/about#real-world"); await sleep(3000); await shot("paper-real-world");
    report.checks.paper = await run("({iframes:[...document.querySelectorAll('iframe')].map(e=>({title:e.title,src:e.src})),canvasCount:document.querySelectorAll('canvas').length})");
    await nav("/missing-page"); await sleep(6000);
    report.checks.moves = [];
    for (const label of ["Beam Saber", "Shield", "Rifle", "Boomerang", "Lifter", "Hold Pose"]) {
      report.checks.moves.push(await run(`(()=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!b)return {label:${JSON.stringify(label)},found:false};b.focus();return {label:${JSON.stringify(label)},disabled:b.disabled}})()`));
      await key("Enter", "Enter", 13); await sleep(350);
    }
    await shot("gundam-playground");
    await send("Network.setBlockedURLs", { urls: ["*justice-gundam.glb*"] });
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await nav("/missing-page"); await sleep(1500);
    report.checks.failedMissingGlb = await run("({fallback:document.body.innerText.includes('The 3D model could not load'),home:!!document.querySelector('a[href=\"/\"]')})");
    await writeFile(`${out}/detail.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await send("Browser.close");
    process.exitCode = 0;
  } else {
  const links = new Set();
  for (const route of ["/", "/about", "/work", "/projects", "/beyond", "/credentials", "/missing-page"]) {
    await size(1440); await nav(route);
    for (const link of await run("[...document.querySelectorAll('a[href]')].map(a=>a.href)")) links.add(link);
    for (const width of [320, 375, 768, 1024, 1440, 2560]) {
      await size(width); await sleep(450);
      report.sizes.push({ route, ...await run("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,h1:document.querySelectorAll('h1').length})") });
    }
    await size(320, 568); await sleep(350);
    report.sizes.push({ route, short: true, ...await run("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})") });
    console.log(`Checked ${route}: six widths and short mobile`);
  }
  // Every internal anchor is checked against the rendered destination page.
  const grouped = new Map();
  for (const href of links) {
    const url = new URL(href);
    if (url.origin !== origin) { report.links.push({ href, external: true, status: "not requested" }); continue; }
    const response = await fetch(url.origin + url.pathname);
    report.links.push({ href, status: response.status, type: response.headers.get("content-type") });
    if (url.hash) {
      if (!grouped.has(url.pathname)) grouped.set(url.pathname, []);
      grouped.get(url.pathname).push(decodeURIComponent(url.hash.slice(1)));
    }
  }
  for (const [path, anchors] of grouped) {
    await nav(path);
    report.checks[`anchors:${path}`] = await run(`(${JSON.stringify(anchors)}).map(id=>({id,exists:!!document.getElementById(id)}))`);
  }
  await size(1440); await nav("/work#rag");
  await run("document.getElementById('rag-stage-0').focus()");
  await key("End", "End", 35);
  report.checks.ragKeyboardEnd = await run("document.activeElement.id === 'rag-stage-4' && document.activeElement.getAttribute('aria-selected') === 'true'");
  await sleep(2700);
  report.checks.ragDoesNotAutoAdvance = await run("document.querySelector('[role=tab][aria-selected=true]').id === 'rag-stage-4'");
  await shot("work-rag");
  await nav("/work");
  await run("document.querySelector('button[class*=evidenceCard]').click()"); await sleep(400);
  report.checks.dialogTabs = [];
  for (let n = 0; n < 6; n++) {
    await key("Tab", "Tab", 9, n % 2 ? 8 : 0);
    report.checks.dialogTabs.push(await run("!!document.activeElement.closest('[role=dialog]')"));
  }
  await key("Escape", "Escape", 27); await sleep(400);
  report.checks.dialogEscape = await run("!document.querySelector('[role=dialog]')");
  await nav("/beyond#right-now"); await sleep(900); await shot("beyond-right-now");
  report.checks.beyond = await run("({height:document.documentElement.scrollHeight,stack:!!document.querySelector('[data-stacking]'),archiveAnimated:document.querySelector('[data-animated]')?.dataset.animated,rows:document.querySelectorAll('#right-now dl').length})");
  await nav("/about"); await shot("about-reading-mask");
  report.checks.paper = await run("({iframeCount:document.querySelectorAll('iframe').length,canvasCount:document.querySelectorAll('canvas').length,text:!!document.querySelector('#real-world')})");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await nav("/beyond#zoom-parallax");
  report.checks.reducedBeyond = await run("({staticGallery:document.querySelector('#zoom-parallax').className,archiveAnimated:document.querySelector('[data-animated]')?.dataset.animated})");
  await nav("/");
  await run("document.querySelector('#gundam-engineering summary').focus()"); await key("Enter", "Enter", 13);
  report.checks.engineeringKeyboard = await run("document.querySelector('#gundam-engineering details').open");
  // 200% equivalent CSS layout viewport (1440 / 2), not an actual browser zoom test.
  await size(720, 450); await nav("/work");
  report.checks.zoomEquivalent = await run("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})");
  await send("Emulation.setEmulatedMedia", { features: [] });
  await size(1440);
  await send("Network.setBlockedURLs", { urls: ["*justice-gundam.glb*"] });
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await nav("/"); await run("document.getElementById('gundam-wrapper').scrollIntoView()"); await sleep(5000);
  report.checks.failedGlb = await run("({fallback:document.body.innerText.includes('The 3D model could not load'),navigation:!!document.querySelector('nav'),work:!!document.querySelector('#selected-work')})");
  await send("Network.setBlockedURLs", { urls: ["*hero-chetan-editorial.jpeg*"] });
  await nav("/");
  report.checks.failedImage = await run("({heading:!!document.querySelector('h1'),navigation:!!document.querySelector('nav'),imageAlt:document.querySelector('#top img')?.alt})");
  await send("Network.setBlockedURLs", { urls: [] });
  await writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ overflows: report.sizes.filter(s => s.scrollWidth > s.width + 1), checks: report.checks, errors: report.errors.length }, null, 2));
  await send("Browser.close");
  }
} finally { ws?.close(); chrome.kill(); }
