// build.mjs
import * as esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);

async function getDirectoryNames(srcPath) {
  try {
    const dirEntries = await fs.readdir(srcPath, { withFileTypes: true });
    const dirNames = dirEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    return dirNames;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

async function buildLanguage(language) {
  const entryPoint = `src/${language}/index.ts`;
  try {
    let missingKeys = false;
    try {
      await execPromise(
        `tsc ${entryPoint} --emitDeclarationOnly --skipLibCheck --declaration --outDir languages`
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

    console.log(
      `${missingKeys ? "⚠️ " : "✅"} - Built`,
      "\x1b[44m",
      `${language}`,
      "\x1b[0m",
      `${missingKeys ? "with missing keys" : "successfully."} \n`
    );
  } catch (error) {
    console.error(`Error building ${language}:`, error);
  }
}

async function buildAllLanguages(languages) {
  for (const language of languages) {
    await buildLanguage(language);
  }
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
