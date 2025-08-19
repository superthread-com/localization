require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

// ========== USER VARIABLES ==========
const TARGET_LANGUAGE = "Spanish"; // Used in AI prompt for translation
const LANGUAGE_CODE = "es"; // Used in the output typscript file and logging e.g. 'es' for Spanish, 'fr' for French
const LINES_PER_CHUNK = 50; // Batch size for AI translations, (1 most accurate, >1 faster)
const INPUT_FILE = "../src/en/index.ts";
const OUTPUT_FILE = `../src/${LANGUAGE_CODE}/translatedOutput.ts`;

// ========== OPENAI SETUP ==========
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ========== HELPERS ==========
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// force all internal straight quotes to curly (prevents delimiter breakage)
function forceCurlyQuotesEverywhere(value) {
  let fixed = value.replace(/"/g, "”"); // U+201D
  fixed = fixed.replace(/'/g, "’"); // U+2019
  return fixed;
}

// Encode \n so each item is one physical line in prompts; decode on return
function encodeNewlines(s) {
  return s.replace(/\n/g, "\\n");
}
function decodeNewlines(s) {
  return s.replace(/\\n/g, "\n");
}

// Extract placeholders: %{x}, {x}, $var
function extractPlaceholders(s) {
  const re = /%\{[^}]+\}|\{[^}]+\}|\$[A-Za-z_]\w*/g;
  const set = new Set();
  let m;
  while ((m = re.exec(s)) !== null) set.add(m[0]);
  return [...set].sort();
}
function samePlaceholders(a, b) {
  const A = extractPlaceholders(a).join("|");
  const B = extractPlaceholders(b).join("|");
  return A === B;
}

// Consider untranslated only if identical (case/trim) and longer than 2 chars
function looksUntranslated(translated, original) {
  if (original.trim().length <= 2) return false;
  return translated.trim().toLowerCase() === original.trim().toLowerCase();
}

// Replace const en / export default en
function replaceLanguageCode(code, fileContent) {
  let updated = fileContent.replace(/const\s+en\s*=\s*{/, `const ${code} = {`);
  updated = updated.replace(
    /export\s+default\s+en\s+as\s+Translations;/,
    `export default ${code} as Translations;`,
  );
  return updated;
}

// ========== EXTRACTION (robust keys/values) ==========
function extractStringsFromFile(content) {
  // Matches:
  //   key: "value" / 'value' / `value`
  //   [key]: "value"
  //   ["now+2d"]: "value"
  // Supports multi-line template literals in values.
  const regex =
    /(?:\[?\s*(['"`])?([\w.\-+]+)\1?\s*\]?)\s*:\s*(['"`])((?:\\.|(?!\3)[^\\])*?)\3/gms;
  let m;
  const out = [];
  while ((m = regex.exec(content)) !== null) {
    out.push({
      key: m[2],
      quote: m[3],
      value: m[4],
      start: m.index,
      end: regex.lastIndex,
      fullMatch: m[0],
    });
  }
  return out;
}

// ========== PROMPTS ==========
function prepareBatchPrompt(pairs) {
  // pairs: [{id, text}]
  const lines = pairs
    .map((p) => `${p.id}\t${encodeNewlines(p.text)}`)
    .join("\n");
  return `
Translate the following English strings to ${TARGET_LANGUAGE}.
The strings are from a project management app.

RULES (IMPORTANT):
- Each input line is: <ID>\\t<text>. Keep the SAME <ID> in your output.
- Output EXACTLY one line per input: <ID>\\t<translation>. Do NOT add or remove lines.
- The translation MUST be a SINGLE LINE (no real newlines). If the input shows \\n, keep it as \\n literally.
- ALWAYS translate time/duration phrases like "2 days from now", "1 week from now", etc., keeping numbers the same.
- The translation MUST contain exactly the SAME placeholders as the input (e.g., %{integrationName}); preserve them verbatim.
- Do NOT include quotes, keys, or extra commentary.
- Do not translate company names, brand names, prices, or technical abbreviations such as 'API' 'h1' or 'h2'.

INPUT:
${lines}
  `.trim();
}

function prepareRetryPrompt(original) {
  const placeholders = extractPlaceholders(original);
  return `
Translate this English string to ${TARGET_LANGUAGE}.

RULES:
- Return ONLY the translated string, ONE SINGLE LINE (no real newlines).
- Keep numbers the same.
- The translation MUST contain exactly these placeholders: ${placeholders.length ? placeholders.join(", ") : "(none)"}.
- Preserve placeholders verbatim.
- If the input shows \\n, keep it as \\n literally.
- Do not translate company names, brand names, prices, or technical abbreviations such as 'API' 'h1' or 'h2'.


${encodeNewlines(original)}
  `.trim();
}

// ========== TRANSLATION ==========
async function translateChunk(objs, chunkIndex) {
  const prompt = prepareBatchPrompt(objs);
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });

    // Strip any accidental fences
    let raw = res.choices[0].message.content
      .replace(/```(?:json|ts|typescript|javascript)?/gi, "")
      .replace(/```/g, "")
      .trim();

    // Parse <ID>\t<translation> lines
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const map = new Map(); // id -> translation
    for (const line of lines) {
      const m = line.match(/^(\d+)\t([\s\S]*)$/);
      if (!m) continue;
      const id = Number(m[1]);
      let tr = m[2].trim();
      tr = decodeNewlines(tr);
      tr = forceCurlyQuotesEverywhere(tr);
      map.set(id, tr);
    }

    // Rebuild result in order and collect placeholder mismatches
    const out = [];
    const badIds = [];
    for (const o of objs) {
      const tr = map.has(o.id) ? map.get(o.id) : o.text; // fallback to original
      out.push(tr);
      if (!samePlaceholders(o.text, tr)) {
        console.warn(
          `Chunk ${chunkIndex} ID ${o.id}: placeholder mismatch; will retry individually.`,
        );
        badIds.push(o.id);
      }
    }

    // Log
    for (let i = 0; i < objs.length; i++) {
      console.log(
        `ID ${objs[i].id}\nEN: ${objs[i].text}\n${LANGUAGE_CODE.toUpperCase()}: ${out[i]}\n---`,
      );
    }

    return { out, badIds };
  } catch (err) {
    console.error(
      `Error in chunk ${chunkIndex}:`,
      err.response?.data || err.message,
    );
    // Fallback to originals; mark none as bad (they'll get caught by unchanged check later)
    return { out: objs.map((o) => o.text), badIds: [] };
  }
}

// ========== MAIN ==========
async function main() {
  const filePath = path.resolve(__dirname, INPUT_FILE);
  let content = fs.readFileSync(filePath, "utf8");

  // Extract & assign stable IDs
  const items = extractStringsFromFile(content).map((o, i) => ({
    ...o,
    id: i,
  }));

  console.log("---EXTRACTED INDEX,KEY,ORIGINAL VALUE---");
  items.forEach((o) =>
    console.log(`${o.id},"${o.key}","${o.value.replace(/"/g, '""')}"`),
  );

  // 1) Batch translation with ID-tagging + placeholder check
  let translated = new Array(items.length);
  const chunked = chunkArray(items, LINES_PER_CHUNK);
  const toRetryIds = new Set(); // placeholder mismatches

  for (let i = 0; i < chunked.length; i++) {
    const group = chunked[i];
    const pairs = group.map((o) => ({ id: o.id, text: o.value }));
    const { out, badIds } = await translateChunk(pairs, i + 1);
    for (let j = 0; j < group.length; j++) {
      translated[group[j].id] = out[j];
    }
    badIds.forEach((id) => toRetryIds.add(id));
  }

  // 2) Add unchanged items (>2 chars) to the retry set
  for (const it of items) {
    if (looksUntranslated(translated[it.id], it.value)) toRetryIds.add(it.id);
  }

  // 3) Strict single-item retries for all offenders
  for (const id of toRetryIds) {
    const original = items[id].value;
    const prompt = prepareRetryPrompt(original);
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
      });
      let tr = res.choices[0].message.content.trim();
      tr = decodeNewlines(tr);
      tr = forceCurlyQuotesEverywhere(tr);
      translated[id] = tr;

      // === CHANGED LOGGING: show the string, not the ID ===
      if (!samePlaceholders(original, tr)) {
        console.warn(`Retry kept placeholder mismatch:\nEN: ${original}\n${LANGUAGE_CODE.toUpperCase()}: ${tr}\n---`);
      } else if (looksUntranslated(tr, original)) {
        console.warn(`Retry still looks untranslated:\nEN: ${original}\n${LANGUAGE_CODE.toUpperCase()}: ${tr}\n---`);
      } else {
        console.log(`Retry OK:\nEN: ${original}\n${LANGUAGE_CODE.toUpperCase()}: ${tr}\n---`);
      }
    } catch (err) {
      console.warn(`Retry error for string:\nEN: ${original}\nError: ${err.message || err}`);
    }
  }

  /* Debug mapping
  console.log("---INDEX,KEY,ORIGINAL,TRANSLATED---");
  items.forEach((o) =>
    console.log(
      `${o.id},"${o.key}","${o.value.replace(/"/g, '""')}","${(translated[o.id] || "").replace(/"/g, '""')}"`,
    ),
  );
  */

  // 4) Replace in output by index (order-locked)
  let output = "";
  let last = 0;
  for (const it of items) {
    const { start, end, quote, value, id } = it;
    output += content.slice(last, start);
    const segment = content.slice(start, end);
    const needle = quote + value + quote;
    const valueIdx = segment.indexOf(needle);
    if (valueIdx !== -1) {
      output += segment.slice(0, valueIdx + 1);
      output += forceCurlyQuotesEverywhere((translated[id] ?? value).trim());
      output += segment.slice(valueIdx + 1 + value.length);
    } else {
      // Fallback (should be rare)
      output += segment;
    }
    last = end;
  }
  output += content.slice(last);

  // 5) Replace language code const/export and write to ../src/{LANGUAGE_CODE}/translatedOutput.ts
  output = replaceLanguageCode(LANGUAGE_CODE, output);
  const outPath = path.resolve(__dirname, OUTPUT_FILE);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, "utf8");

  console.log("Translation completed! Output written to", OUTPUT_FILE);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
