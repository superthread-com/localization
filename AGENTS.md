# Agents

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

This is a TypeScript-based localization package (`@superthread-com/localization`) for Superthread's front-end applications. It manages translation keys and values across multiple languages.

## Project Structure

```
.
├── src/
│   ├── index.ts              # Main package entry - exports types
│   ├── types.ts              # TranslationKeys enum and Translations type
│   ├── en/
│   │   └── index.ts          # English translations (source of truth)
│   ├── bs/
│   │   └── index.ts          # Bosnian translations
│   ├── de/
│   │   └── index.ts          # German translations
│   ├── fr/
│   │   └── index.ts          # French translations
│   └── pl/
│       └── index.ts          # Polish translations
├── languages/                # Build output directory (gitignored)
├── scripts/                  # Build and generation scripts
├── package.json
└── tsconfig.json
```

## Commands

### Build

```bash
npm run build
```

Builds all language files using esbuild. Compiles TypeScript sources from `src/{language}/index.ts` to `languages/{language}/` directories.

### Testing

```bash
npm test          # Run tests with vitest
npm run prepack   # Full build process (run before publishing)
```

### Linting & formatting

```bash
npm run lint       # Lint & format all files with Prettier
npm run lint:check # Check linting & formatting without modifying files
```

### TypeScript Type Checking

```bash
npx tsc -b
```

Type-check the entire project. Use this to verify all translations are complete.

## Architecture

### Translation System

**English as Source of Truth**: The `src/en/index.ts` file defines all translation keys. The `TranslationKeys` enum in `src/types.ts` mirrors these keys.

**Type Safety**: Each language file must implement the `Translations` type, which is `Record<TranslationKeys, string>`. This ensures all languages have translations for every key (TypeScript will show errors for missing keys).

**Language Files**: Each language is in `src/{language-code}/index.ts`:

```typescript
import { Translations } from "../types";

const translations: Translations = {
  inviteTeamMembersTo: "Translation here",
  loggingIn: "Translation here",
  // ... all other keys
};

export default translations;
```

## Adding a New Translation Key

1. Add the key to `src/types.ts` in the `TranslationKeys` enum
2. Add the English translation to `src/en/index.ts`
3. TypeScript will show errors in all other language files for the missing key
4. Add the key to other language files (or accept incomplete translations)
5. Run `npx tsc -b` to verify everything compiles
6. Run `npm run build` to build the package

## Adding a New Language

See `.github/CONTRIBUTING.md` for the complete process:

1. Create issue in format: `[language code: "native language name"]` (e.g., `[es: "Español"]`)
2. Create folder `src/{language-code}/`
3. Add `src/{language-code}/index.ts` with the structure shown above
4. Import `Translations` type and define all translation keys
5. Run `npm run prepack` to validate
6. Submit PR with branch name: `{languagecode}_{username}_addkey`

## Important Notes

- The package uses `type: "module"` - all code uses ESM syntax
- Published files include only `languages/**` and `index.js` (see `package.json` files field)
- The `types` field in package.json points to `languages/types.d.ts`
- Missing translation keys will cause TypeScript compilation errors
- The build process validates that all languages have matching keys
- Translation keys use various formats: camelCase, dot notation (e.g., `slash.group.media`), and special characters (e.g., `now+2d`, `now-1h`)
