import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const roots = [
  "src",
  "public",
  "README.md",
  "ARCHITECTURE.md",
  "AGENTS.md",
  "CHANGELOG.md",
  "docs",
];
const extensions = new Set([".ts", ".tsx", ".css", ".md", ".json", ".svg", ".txt", ".html"]);

const patterns = [
  { name: "iran", re: /\biran\b/i },
  { name: "iranian", re: /\biranian\b/i },
  { name: "tehran", re: /\btehran\b/i },
  { name: "rial", re: /\brials?\b/i },
  { name: "toman", re: /\btomans?\b/i },
  { name: "626", re: /(?<!\d)626(?!\d)/ },
  { name: "hossein mokhtari", re: /hossein\s+mokhtari/i },
  { name: "mokhtari", re: /\bmokhtari\b/i },
  { name: "fa-person", re: /حسین\s*مختاری/ },
  { name: "fa-iran", re: /ایران/ },
  { name: "fa-tehran", re: /تهران/ },
  { name: "fa-rial", re: /ریال/ },
  { name: "fa-toman", re: /تومان/ },
  { name: "isfahan", re: /\bisfahan\b/i },
  { name: "shiraz", re: /\bshiraz\b/i },
  { name: "mashhad", re: /\bmashhad\b/i },
  { name: "tabriz", re: /\btabriz\b/i },
  { name: "karaj", re: /\bkaraj\b/i },
  { name: "qom", re: /\bqom\b/i },
  { name: "ahvaz", re: /\bahvaz\b/i },
  { name: "kermanshah", re: /\bkermanshah\b/i },
  { name: "اصفهان", re: /اصفهان/ },
  { name: "شیراز", re: /شیراز/ },
  { name: "مشهد", re: /مشهد/ },
  { name: "تبریز", re: /تبریز/ },
  { name: "اهواز", re: /اهواز/ },
  { name: "کرمانشاه", re: /کرمانشاه/ },
  { name: "یزد", re: /یزد/ },
  { name: "کرمان", re: /کرمان/ },
];

async function collect(entry) {
  const absolute = path.join(root, entry);
  const stat = await readdir(absolute).then(
    () => "dir",
    () => "file",
  );
  if (stat === "file") return [absolute];
  const files = [];
  const stack = [absolute];
  while (stack.length > 0) {
    const current = stack.pop();
    const items = await readdir(current, { withFileTypes: true });
    for (const item of items) {
      const next = path.join(current, item.name);
      if (item.isDirectory()) stack.push(next);
      else if (extensions.has(path.extname(item.name))) files.push(next);
    }
  }
  return files;
}

const files = (await Promise.all(roots.map((entry) => collect(entry)))).flat();
const hits = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.re.test(line)) {
        hits.push(`${path.relative(root, file)}:${index + 1} ${pattern.name}`);
      }
    }
  });
}

if (hits.length > 0) {
  console.error(hits.join("\n"));
  process.exit(1);
}

console.log(`catalog guard ok (${files.length} files)`);
