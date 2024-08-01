import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function writeTypes(enumString) {
  // Prepare the output string for the TypeScript file
  const output = `export enum TranslationKeys {\n  ${enumString}\n}\n\nexport type Translations = Record<TranslationKeys, string>;`;

  // Write the output to the types.ts file
  fs.writeFileSync(path.join(__dirname, "../src/types.ts"), output, "utf8");

  console.log(
    enumString
      ? "Enum keys have been written to types.ts"
      : "Existing keys cleared from types.ts.",
  );
}

export default writeTypes;
