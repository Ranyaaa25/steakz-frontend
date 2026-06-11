import { execFile, spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(frontendDir, "..", "..");
const execFileAsync = promisify(execFile);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backendIsRunning() {
  return new Promise((resolve) => {
    const req = http.get("http://localhost:3000/home", (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(700, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function killPort(port) {
  if (process.platform === "win32") {
    console.log(`If port ${port} is busy on Windows, stop the old Vite terminal and open http://localhost:${port}/.`);
    return;
  }

  try {
    const { stdout } = await execFileAsync("lsof", ["-ti", `:${port}`]);
    const pids = stdout
      .split(/\s+/)
      .map((pid) => pid.trim())
      .filter(Boolean)
      .filter((pid) => pid !== String(process.pid));

    if (!pids.length) return;

    console.log(`Port ${port} is busy. Stopping old process ${pids.join(", ")} before starting Vite...`);
    await execFileAsync("kill", ["-9", ...pids]);
  } catch (error) {
    if (error?.code === 1) return;
    console.log(`Could not clear port ${port}. If Vite reports a conflict, use the already-running URL: http://localhost:${port}/`);
  }
}

async function waitForBackend() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await backendIsRunning()) return true;
    await wait(500);
  }
  return false;
}

const children = [];

function start(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${command} ${args.join(" ")} exited with code ${code}`);
    }
  });
  return child;
}

process.on("SIGINT", () => {
  for (const child of children) child.kill("SIGINT");
  process.exit(130);
});

await killPort(5173);

if (!(await backendIsRunning())) {
  console.log("Starting Steakz backend on http://localhost:3000 ...");
  start("npm", ["run", "start:dev"], projectRoot);
  const ready = await waitForBackend();
  if (!ready) {
    console.error("Backend did not start on http://localhost:3000. Check the backend terminal output above.");
    process.exit(1);
  }
} else {
  console.log("Steakz backend already running on http://localhost:3000.");
}

console.log("Starting Vite on http://localhost:5173 ...");
start("npx", ["vite", "--host", "0.0.0.0"], path.resolve(projectRoot, "frontend"));
