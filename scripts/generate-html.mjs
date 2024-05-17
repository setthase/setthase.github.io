import Handlebars from "handlebars";
import { minify } from "html-minifier-terser";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve, relative } from "node:path";

import education from "../data/education.mjs";
import experience from "../data/experience.mjs";
import profile from "../data/profile.mjs";
import projects from "../data/projects.mjs";
import skills from "../data/skills.mjs";
import testimonials from "../data/testimonials.mjs";

// Define constants used across file
const __dirname = dirname(import.meta.url).replace("file://", "");

const ROOT_DIR = resolve(__dirname, "..");
const TEMPLATES_DIR = resolve(ROOT_DIR, "./src/templates");
const PARTIALS_DIR = resolve(TEMPLATES_DIR, "./partials");
const PAGES_DIR = resolve(TEMPLATES_DIR, "./pages");

const OUTPUT_DIR = resolve(ROOT_DIR, "./dist");

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

const minifyOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

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

// Register Handlebars helpers
Handlebars.registerHelper("toDate", (timestamp) => {
  if (!timestamp) return "current";

  const date = new Date(timestamp);

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
});

Handlebars.registerHelper("currentYear", () => {
  const date = new Date();

  return date.getFullYear();
});

Handlebars.registerHelper("join", (array, symbol = ",") => {
  return array.join(symbol);
});

Handlebars.registerHelper("lowercase", (string) => {
  return string.toLowerCase();
});

Handlebars.registerHelper("xif", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

Handlebars.registerHelper("expandSkillId", (id) => {
  return skills.find((s) => s.id === id)?.name;
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
  const filename = resolve(OUTPUT_DIR, basename(file, extname(file)) + ".html");
  const template = Handlebars.compile(
    await readFile(file, { encoding: "utf-8" }),
  );

  await writeFile(
    filename,
    await minify(
      template({
        education,
        experience,
        profile,
        projects,
        skills,
        testimonials,
      }),
      minifyOptions,
    ),
    { encoding: "utf-8" },
  );

  console.log(relative(ROOT_DIR, filename));
}
