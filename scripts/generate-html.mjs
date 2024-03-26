import Handlebars from "handlebars";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";

import experience from "../data/experience.mjs";
import profile from "../data/profile.mjs";
import projects from "../data/projects.mjs";
import skills from "../data/skills.mjs";
import testimonials from "../data/testimonials.mjs";

// Define constants used across file
const __dirname = dirname(import.meta.url).replace("file://", "");

const TEMPLATES_DIR = resolve(__dirname, "../src/templates");
const PARTIALS_DIR = resolve(TEMPLATES_DIR, "./partials");
const PAGES_DIR = resolve(TEMPLATES_DIR, "./pages");

const OUTPUT_DIR = resolve(__dirname, "../dist");

/**
 * Read `root` directory recursively and return list of files paths
 */
async function getFilesRecursively(root, files = []) {
  const tree = await readdir(root);

  for (let branch of tree) {
    const path = resolve(root, branch);
    const info = await stat(path);

    if (info.isFile()) files.push(path);
    if (info.isDirectory()) await getFilesRecursively(path, files);
  }

  return files;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Register Handlebars helpers
Handlebars.registerHelper("toDate", (timestamp) => {
  if (!timestamp) return "current";

  const date = new Date(timestamp);

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
});

// Register Handlebars partials
for (let file of await getFilesRecursively(PARTIALS_DIR)) {
  Handlebars.registerPartial(
    basename(file, extname(file)),
    await readFile(file, { encoding: "utf-8" }),
  );
}

// Ensure output directory is present
await mkdir(OUTPUT_DIR, { recursive: true });

// Generate HTML pages from templates
for (let file of await getFilesRecursively(PAGES_DIR)) {
  const template = Handlebars.compile(
    await readFile(file, { encoding: "utf-8" }),
  );

  await writeFile(
    resolve(OUTPUT_DIR, basename(file, extname(file)) + ".html"),
    template({ experience, profile, projects, skills, testimonials }),
    { encoding: "utf-8" },
  );
}
