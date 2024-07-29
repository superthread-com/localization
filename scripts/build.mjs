// build.mjs
import * as esbuild from "esbuild";
import * as core from "@actions/core";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);
import getDirectoryNames from "./getDirectories.mjs";
import { getMissingKeys } from "./compareKeys.mjs";

const summaryTable = [
  [
    { data: "Language", header: true },
    { data: "Status", header: true },
    { data: "Missing keys", header: true },
  ],
];

async function logBuildStatus(language, missingKeys) {
  if (missingKeys) {
    core.warning(
      `Built ` + `\x1b[44m${language}\x1b[0m ` + `with missing keys. \n`
    );
    const missingKeys = await getMissingKeys(language);
    core.info(`\nMissing ${missingKeys.length} keys in ${language}:`);
    const slice = missingKeys.slice(0, 20);
    core.info(`${slice},\n and ${missingKeys.length - 20} more...`);
    summaryTable.push([language, "⚠️", missingKeys.length]);
  } else {
    core.notice(`Built ` + `\x1b[44m${language}\x1b[0m ` + `successfully. \n`);
    summaryTable.push([language, "✅", "0"]);
  }
}

async function buildLanguage(language) {
  const entryPoint = `src/${language}/index.ts`;
  try {
    let missingKeys = false;
    try {
      await execPromise(
        `tsc ${entryPoint} --emitDeclarationOnly --declaration --skipLibCheck --outDir languages`
      );
    } catch (error) {
      const errMsg = error.stdout || error.stderr;
      let message = errMsg;

      console.log("Error message:", errMsg);
      // handle missing keys error
      const missing =
        "is missing the following properties from type 'Translations'";
      if (errMsg.includes(missing)) {
        const [, keys] = errMsg.split(missing);
        missingKeys = true;
        message = `Language '${language}' ${missing} ${keys}`;
      }
      console.error(
        `Error compiling ${language} with tsc: \n`,
        "\x1b[31m",
        message,
        "\x1b[0m"
      );
    }

    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: "browser",
      format: "esm",
      target: "es2020",
      charset: "utf8",
      outdir: `languages/${language}`,
    });

    logBuildStatus(language, missingKeys);
  } catch (error) {
    console.error(`Error building ${language}:`, error);
  }
}

async function buildAllLanguages(languages) {
  for (const language of languages) {
    await buildLanguage(language);
  }

  await core.summary.addHeading("Build summary").addTable(summaryTable).write();
  await core.setOutput("summary", summaryTable);
}

// Convert import.meta.url to a file path and then get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDirectoryPath = path.join(__dirname, "../src");

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "es2020",
  outdir: "./",
});

getDirectoryNames(srcDirectoryPath).then((languageFolders) => {
  console.log("🌎 Language folders found in /src", languageFolders);
  buildAllLanguages(languageFolders);
});
