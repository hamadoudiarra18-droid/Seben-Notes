// Copies the built web app (www/) into the simple Android project and zips it for Code Assist.
// Run after `npm run build`.
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const assets = root + "codeassist/SebenNotes/app/src/main/assets/www";
rmSync(assets, { recursive: true, force: true });
mkdirSync(assets, { recursive: true });
cpSync(root + "www", assets, { recursive: true });
rmSync(assets + "/sw.js", { force: true });
mkdirSync(root + "dist", { recursive: true });
rmSync(root + "dist/SebenNotes-CodeAssist.zip", { force: true });
execSync("zip -qr ../dist/SebenNotes-CodeAssist.zip SebenNotes -x 'SebenNotes/.gradle/*' 'SebenNotes/build/*' 'SebenNotes/app/build/*'", { cwd: root + "codeassist", stdio: "inherit" });
console.log("dist/SebenNotes-CodeAssist.zip ready");
