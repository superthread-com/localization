require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

// ========== Configuration =========
// Adjust these paths and settings as needed

const TARGET_LANGUAGE = "Brazilian Portuguese"; // Used in AI prompt for translation
const LANGUAGE_CODE = "ptbr"; // Used in the output typscript file and logging e.g. 'es' for Spanish, 'fr' for French
const LINES_PER_CHUNK = 50; // Batch size for AI translations, (1 most accurate, >1 faster)
const INPUT_FILE = "../src/en/index.ts";
const OUTPUT_FILE = `../src/${LANGUAGE_CODE}/translatedOutput.ts`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========== SETUP ==========

// Utility to batch an array
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// For extracting key/value pairs, even if the value is on a new line
function extractStringsFromFile(content) {
  // Regex to match:
  //   key: "value"
  //   'key': "value"
  //   "key": "value"
  //   ["key"]: "value"
  //   [key]: "value"
  //   Handles all quote styles and multiline template literals.
  //   Key can be [optionalBrackets.optionalQuotes.key]
  const regex =
    /(?:\[?\s*(['"`])?([\w.\-]+)\1?\s*\]?)\s*:\s*(['"`])((?:\\.|(?!\3)[^\\])*?)\3/gms;
  let match;
  const strings = [];
  while ((match = regex.exec(content)) !== null) {
    // match[0]: whole match
    // match[2]: key
    // match[3]: value quote
    // match[4]: value
    strings.push({
      key: match[2],
      quote: match[3],
      value: match[4],
      start: match.index,
      end: regex.lastIndex,
      fullMatch: match[0],
    });
  }
  return strings;
}

function prepareBatchPrompt(texts) {
  return `
Translate the following ${texts.length} English strings to ${TARGET_LANGUAGE}, preserving any placeholders like %{provider}, {name}, $variable, etc.
If a string contains curly quotes (“ ” or ‘ ’) in the original, use curly quotes in the translated string as well.
Always translate phrases like "2 days from now", "1 week from now", "1 month from now", "6 months from now", etc. to the target language, keeping the numbers the same.
Do not translate code comments like // or /* comments */.
Do not translate company names, brand names, prices, or technical abbreviations such as 'API' 'h1' or 'h2'.
Return ONLY the translated strings, in the same order, one per line. Do NOT return the keys or quotes. Do not explain anything.

${texts.join("\n")}
  `.trim();
}

// === FORCE ALL STRAIGHT QUOTES INSIDE TO CURLY ===
function forceCurlyQuotesEverywhere(value) {
  // Replace all " with ” (curly double)
  let fixed = value.replace(/"/g, "”");
  // Replace all ' with ’ (curly single)
  fixed = fixed.replace(/'/g, "’");
  return fixed;
}

async function translateChunk(texts, chunkIndex) {
  const prompt = prepareBatchPrompt(texts);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });
    const output = response.choices[0].message.content.trim();
    let split = output.split("\n").map((l) => l.trim());
    if (split.length !== texts.length) {
      console.warn(
        `Chunk ${chunkIndex}: expected ${texts.length} lines but got ${split.length}. Will keep originals for failed lines.`,
      );
      while (split.length < texts.length) split.push(texts[split.length]);
    }
    // Force curly quotes for all translated strings
    for (let i = 0; i < split.length; i++) {
      split[i] = forceCurlyQuotesEverywhere(split[i]);
      console.log(
        `EN: ${texts[i]}\n${LANGUAGE_CODE.toUpperCase()}: ${split[i]}\n---`,
      );
    }
    return split;
  } catch (err) {
    console.error(
      `Error in chunk ${chunkIndex}:`,
      err.response?.data || err.message,
    );
    return texts;
  }
}

function looksUntranslated(translated, original) {
  if (original.trim().length <= 2) return false;
  return translated.trim().toLowerCase() === original.trim().toLowerCase();
}

// Replace 'en' variable and export in the output file with the target language code
function replaceLanguageCode(code, fileContent) {
  // Replace const en = { (with or without spaces/tabs)
  let updated = fileContent.replace(/const\s+en\s*=\s*{/, `const ${code} = {`);
  // Replace export default en as Translations;
  updated = updated.replace(
    /export\s+default\s+en\s+as\s+Translations;/,
    `export default ${code} as Translations;`,
  );
  return updated;
}

// ========== MAIN ==========

async function main() {
  const filePath = path.resolve(__dirname, INPUT_FILE);
  let content = fs.readFileSync(filePath, "utf8");

  const stringObjs = extractStringsFromFile(content);

  // 1. Batch translation
  let translatedValues = [];
  const chunked = chunkArray(stringObjs, LINES_PER_CHUNK);
  for (let i = 0; i < chunked.length; i++) {
    const group = chunked[i];
    const texts = group.map((obj) => obj.value);
    const translations = await translateChunk(texts, i + 1); // returns an array
    translatedValues.push(...translations);
  }

  // 2. Retry pass for failed/unchanged translations, skipping very short strings
  for (let i = 0; i < stringObjs.length; i++) {
    const original = stringObjs[i].value;
    const translated = translatedValues[i];
    if (original.trim().length <= 2) continue; // Skip retry for short strings
    if (looksUntranslated(translated, original)) {
      const retryPrompt =
        `
Translate this string from English to ${TARGET_LANGUAGE}, preserving placeholders like %{provider}, {name}, $variable, etc.
If the string contains curly quotes (“ ” or ‘ ’) in the original, use curly quotes in the translated string as well. Do not translate company names, prices, of technical abbreviations such as 'API'.
Return ONLY the translated string.
      `.trim() +
        "\n" +
        original;
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: retryPrompt }],
          temperature: 0.2,
          max_tokens: 1500,
        });
        let retryTranslation = response.choices[0].message.content.trim();
        // Always force curly quotes after retry as well
        retryTranslation = forceCurlyQuotesEverywhere(retryTranslation);
        translatedValues[i] = retryTranslation;
        if (looksUntranslated(retryTranslation, original)) {
          console.log(`Still failed to translate: "${original}"`);
        } else {
          console.log("Retry worked for:", original);
        }
      } catch (err) {
        console.log(`Retry error for "${original}"`, err);
      }
    }
  }

  // 3. Replace in output by index, never skipping!
  let output = "";
  let lastIndex = 0;
  for (let i = 0; i < stringObjs.length; i++) {
    const { start, end, quote, value } = stringObjs[i];
    output += content.slice(lastIndex, start);
    const matchText = content.slice(start, end);
    const valueIndex = matchText.indexOf(quote + value + quote);
    if (valueIndex !== -1) {
      output += matchText.slice(0, valueIndex + 1);
      output += forceCurlyQuotesEverywhere(translatedValues[i].trim());
      output += matchText.slice(valueIndex + 1 + value.length);
    } else {
      output += matchText;
    }
    lastIndex = end;
  }
  output += content.slice(lastIndex);

  // 4. Replace language code in variable and export default
  const outputDir = path.dirname(path.resolve(__dirname, OUTPUT_FILE));
  fs.mkdirSync(outputDir, { recursive: true });
  output = replaceLanguageCode(LANGUAGE_CODE, output);
  fs.writeFileSync(path.resolve(__dirname, OUTPUT_FILE), output, "utf8");
  console.log("Translation completed! Output written to", OUTPUT_FILE);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
