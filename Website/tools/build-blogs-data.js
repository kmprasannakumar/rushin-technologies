const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const jsonPath = path.join(root, "data", "blogs.json");
const jsPath = path.join(root, "data", "blogs.js");

function main() {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Missing source file: ${jsonPath}`);
  }

  const raw = fs.readFileSync(jsonPath, "utf8");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in data/blogs.json: ${error.message}`);
  }

  const output = `window.RUSHIN_BLOGS_DATA = ${JSON.stringify(parsed, null, 2)};\n`;
  fs.writeFileSync(jsPath, output, "utf8");

  const count = Array.isArray(parsed) ? parsed.length : 0;
  console.log(`Generated data/blogs.js from data/blogs.json (${count} post${count === 1 ? "" : "s"}).`);
}

main();
