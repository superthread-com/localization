# Translator script

This is a node script to translate all the Superthread strings in batches via Open AI

## Usage

1. Open terminal in the localization/translator folder
2. Install dependencies (if needed): `npm init -y` `npm install openai dotenv`
3. Ensure you have a `.env` file in the translator folder with your `OPENAI_API_KEY` defined.
4. Run the script `node translator/translateStrings.js`
5. Review the `translatedOutput.ts` file and if happy rename to `index.ts`
5. Run in the localization repo (not translator folder) to automaticlly generate new types and clean up formatting: `npm run prepack && npm run format`
