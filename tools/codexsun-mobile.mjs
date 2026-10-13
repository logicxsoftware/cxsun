import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, lstatSync, realpathSync, symlinkSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const appRoot = join(root, "apps/codexsun/mobile");
const output = join(root, "dist/apps/codexsun/mobile");
const flutterOutput = join(appRoot, "build");
mkdirSync(output, { recursive: true });
// Flutter requires this path; the junction keeps all output in root dist.
if (!existsSync(flutterOutput))
  symlinkSync(output, flutterOutput, platform() === "win32" ? "junction" : "dir");
if (
  !lstatSync(flutterOutput).isSymbolicLink() ||
  realpathSync(flutterOutput) !== realpathSync(output)
)
  throw new Error(
    "Mobile build must point to root dist. Preserve existing output before retrying."
  );
const [command, ...extra] = process.argv.slice(2);
const commands = {
  analyze: ["analyze"],
  test: ["test"],
  run: ["run"],
  "build-debug": ["build", "apk", "--debug"]
};
if (!commands[command]) throw new Error("Use analyze, test, run, or build-debug.");
const flutter =
  process.env.CXSUN_FLUTTER_BIN ||
  (platform() === "win32" ? join(homedir(), "development/flutter/bin/flutter.bat") : "flutter");
if (platform() === "win32" && !existsSync(flutter))
  throw new Error("Set CXSUN_FLUTTER_BIN to Flutter.");
const args = [...commands[command], ...extra];
if (platform() === "win32" && [flutter, ...args].some((value) => /[\r\n&|<>^%"!]/u.test(value)))
  throw new Error("Flutter paths and arguments must not contain shell control characters.");
const windowsCommand = [flutter, ...args].map((value) => `"${value}"`).join(" ");
const result =
  platform() === "win32"
    ? spawnSync(
        process.env.ComSpec || "cmd.exe",
        ["/d", "/v:off", "/s", "/c", `"${windowsCommand}"`],
        {
          cwd: appRoot,
          env: process.env,
          windowsVerbatimArguments: true,
          stdio: "inherit"
        }
      )
    : spawnSync(flutter, args, {
        cwd: appRoot,
        env: process.env,
        stdio: "inherit"
      });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
