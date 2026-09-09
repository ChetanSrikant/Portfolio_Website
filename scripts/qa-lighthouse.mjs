// Use a locally installed/cached Lighthouse CLI; does not install packages.
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const cli = process.argv[2];
if (!cli) throw new Error("Pass the path to lighthouse/cli/index.js");
const directory = "tmp/phase-8-10-qa";
await mkdir(directory, { recursive: true });
const results = [];
for (const mode of ["mobile", "desktop"]) {
  for (let run = 1; run <= 3; run++) {
    const file = `${directory}/lighthouse-${mode}-${run}.json`;
    const args = [cli, process.env.QA_ORIGIN || "http://127.0.0.1:4173/", "--quiet", "--chrome-flags=--headless=new", "--output=json", `--output-path=${file}`, ...(mode === "desktop" ? ["--preset=desktop"] : [])];
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, { windowsHide: true, stdio: "inherit" });
      child.on("error", reject);
      child.on("exit", code => code === 0 ? resolve() : reject(new Error(`Lighthouse exited ${code}`)));
    });
    const report = JSON.parse(await readFile(file, "utf8"));
    const data = { mode, run, performance: report.categories.performance.score * 100, accessibility: report.categories.accessibility.score * 100,
      lcp: report.audits["largest-contentful-paint"].numericValue, cls: report.audits["cumulative-layout-shift"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue };
    results.push(data); console.log(JSON.stringify(data));
  }
}
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const medians = Object.fromEntries(["mobile", "desktop"].map(mode => [mode, Object.fromEntries(["performance", "accessibility", "lcp", "cls", "tbt"].map(metric => [metric, median(results.filter(r => r.mode === mode).map(r => r[metric]))]))]));
await writeFile(`${directory}/lighthouse-medians.json`, JSON.stringify({ results, medians }, null, 2));
console.log(JSON.stringify(medians, null, 2));
