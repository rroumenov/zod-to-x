// Turns Conventional Commit subjects since the last release into changeset files.
// fix -> patch, feat -> minor, "type!:" or "BREAKING CHANGE" -> major, anything else -> no release.
// Usage: node scripts/commits-to-changesets.mjs [--dry-run]
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const dryRun = process.argv.includes("--dry-run");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const pkg = JSON.parse(execFileSync("cat", ["package.json"], { encoding: "utf8" })).name;

const RELEASE_RE = "^chore\\(release\\)|^Release [0-9]";
const COMMIT_RE = /^(\w+)(\([^)]*\))?(!)?:\s+(.+)$/;

const anchor = git("log", "-1", "--format=%H", "-E", `--grep=${RELEASE_RE}`);
const head = git("rev-parse", "HEAD");

if (anchor === head) {
    console.log("HEAD is a release commit; nothing to generate.");
    process.exit(0);
}

const range = anchor ? `${anchor}..HEAD` : "HEAD";
const log = git("log", "--reverse", "--format=%H%x1f%s%x1f%b%x1e", range);

for (const entry of log.split("\x1e")) {
    const [sha, subject, body] = entry.trim().split("\x1f");
    if (!sha) continue;

    const m = COMMIT_RE.exec(subject);
    if (!m) continue;

    const [, type, , bang, text] = m;
    const breaking = Boolean(bang) || /^BREAKING[ -]CHANGE:/m.test(body ?? "");
    const bump = breaking ? "major" : type === "feat" ? "minor" : type === "fix" ? "patch" : null;
    if (!bump) continue;

    const file = `.changeset/auto-${sha.slice(0, 8)}.md`;
    console.log(`${bump.padEnd(5)} ${sha.slice(0, 8)} ${subject}`);
    if (!dryRun) writeFileSync(file, `---\n"${pkg}": ${bump}\n---\n\n${text}\n`);
}
