import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = 4173;
const directPaths = [
  "/",
  "/writing",
  "/flashcards",
  "/recall",
  "/notes",
  "/stats",
];
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    host,
    "--port",
    String(port),
    "--strictPort",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForPreview() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Vite preview exited early.\n${serverOutput}`);
    }

    try {
      const response = await fetch(`http://${host}:${port}/`);
      if (response.ok) return;
    } catch {
      // The preview process is still starting.
    }
    await delay(100);
  }

  throw new Error(`Vite preview did not start in time.\n${serverOutput}`);
}

try {
  await waitForPreview();

  for (const path of directPaths) {
    const response = await fetch(`http://${host}:${port}${path}`);
    const html = await response.text();
    const isAppShell =
      response.ok &&
      response.headers.get("content-type")?.includes("text/html") &&
      html.includes('<div id="root"></div>');

    if (!isAppShell) {
      throw new Error(
        `Direct path ${path} did not return the production app shell (status ${response.status}).`,
      );
    }
  }

  console.log(`Production preview served ${directPaths.length} direct routes.`);
} finally {
  server.kill("SIGTERM");
}
