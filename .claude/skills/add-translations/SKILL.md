---
name: add-translations
description: Add new translation keys to the localization package across all supported languages. Use this skill when the user asks to add translations, add localization keys, add i18n strings, create translation entries, or mentions adding text that needs to be translated across multiple languages. This skill manages translations for English (en), Bosnian (bs), German (de), Spanish (es), French (fr), Indonesian (id), Korean (ko), Polish (pl), Portuguese-Brazil (pt-BR), Chinese Simplified (zh-Hans), and Chinese Traditional (zh-Hant).
allowed-tools: Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(npm run build), Read, Edit, Glob, Grep
---

# Add Translations

This skill adds new translation keys to the localization package across all supported languages.

## Supported Languages

This package currently supports many languages, e.g:

- `en` - English (source of truth)
- `bs` - Bosnian
- `de` - German
- `es` - Spanish
- `fr` - French
  ...

You can list all languages by listing all directories in `src/`.

## Project Architecture

- **Types**: `src/types.ts` contains the `TranslationKeys` enum
- **Source of Truth**: `src/en/index.ts` contains English translations
- **Other Languages**: Each language has `src/{language-code}/index.ts`
- **Type Safety**: All language files must implement `Translations` type

## Translation Key Naming Conventions

Translation keys follow various formats (review existing keys in `src/types.ts` for patterns):

- **camelCase**: `inviteTeamMembersTo`, `loggingIn`
- **Dot notation**: `slash.group.media`, `billing.monthly`, `menu.add-comment`
- **Time expressions**: `now+2d`, `now-1h`, `now+1M`
- **With underscores**: `cardsCount_one`, `cardsCount_other`

When adding a new key, follow the naming pattern that matches similar existing keys.

## Step-by-Step Process

If the user provides multiple keys for translation, repeat steps 1 to 5 for all keys and only run validation steps 6 to 8 at the end.

### Step 1: Extract Information from User Request

From the user's request, identify:

- **Key name**: The translation key identifier (e.g., `loginButton`, `error.notFound`)
- **English translation**: The English text for this key

If either is missing or unclear, ask the user to provide it.

### Step 2: Check if Key Already Exists

Search in `src/types.ts` to verify the key doesn't already exist:

```bash
grep -n "KeyName = " src/types.ts
```

If found, inform the user and ask if they want to update instead.

### Step 3: Add to TranslationKeys Enum

Edit `src/types.ts`:

- Find the `export enum TranslationKeys {` section
- Add the new key in alphabetical order or logical grouping
- Format: `KeyName = "keyName",`
- Use proper capitalization for the enum name (PascalCase)
- The string value should match the key name exactly

Example:

```typescript
export enum TranslationKeys {
  // ... existing keys ...
  LoginButton = "loginButton",
  // ... more keys ...
}
```

### Step 4: Add to English Translations (Source of Truth)

Edit `src/en/index.ts`:

- Find the translations object
- Add the key with the English translation value
- Maintain alphabetical or logical order
- Format: `keyName: "English translation text",`

Example:

```typescript
const en = {
  // ... existing translations ...
  loginButton: "Log in",
  // ... more translations ...
};
```

### Step 5: Add to All Other Languages

For each language directory (e.g. `bs`, `de`, `es`, `fr`, ...):

- Edit `src/{language-code}/index.ts`
- Add the same key with the English translation as a placeholder
- Maintain the same order as in the English file

Example for `src/de/index.ts`:

```typescript
const de = {
  // ... existing translations ...
  loginButton: "Log in", // Will be translated by language maintainers later
  // ... more translations ...
};
```

**Note**: We use the English translation as a placeholder. Native speakers will provide proper translations later.

### Step 6: Validate TypeScript Compilation

Run TypeScript type checking to ensure all files are valid:

```bash
npx tsc -b
```

If there are errors, fix them before proceeding.

### Step 7: Run Build

Build the package to ensure everything works:

```bash
npm run build
```

If the build fails, review and fix any errors.

### Step 8: Stage and Commit Changes

Stage all modified files:

```bash
git add src/*
```

Create a commit with a descriptive message:

```bash
git commit -m "add translation key: {keyName}

Added new translation key for {brief description}"
```

Replace `{keyName}` with the actual key name and `{brief description}` with a short description of what the key is for.

## Examples

### Example 1: Simple Key

**User Request**: "Add a translation key for logout button"

**Key name**: `logoutButton`
**English translation**: "Log out"

1. Add to `src/types.ts`: `LogoutButton = "logoutButton",`
2. Add to `src/en/index.ts`: `logoutButton: "Log out",`
3. Add to all other language files with same value
4. Commit: `git commit -m "add translation key: logoutButton"`

### Example 2: Nested Key with Dots

**User Request**: "Add translation for settings menu privacy option"

**Key name**: `menu.settings.privacy`
**English translation**: "Privacy settings"

1. Add to `src/types.ts`: `MenuSettingsPrivacy = "menu.settings.privacy",`
2. Add to `src/en/index.ts`: `menu.settings.privacy: "Privacy settings",`
3. Add to all other language files
4. Commit with descriptive message

### Example 3: Pluralization Key

**User Request**: "Add translation for number of users"

**Key name**: `usersCount_one` and `usersCount_other`
**English translations**: "1 user" and "%{count} users"

This requires two keys following the pluralization pattern used in the codebase.

## Important Reminders

1. **Always check git status first** - reject if there are uncommitted changes
2. **English is the source of truth** - all other languages use English as placeholder initially
3. **Follow existing naming patterns** - review similar keys in `src/types.ts`
4. **Update ALL language files** - missing a language will cause TypeScript errors
5. **Build and type-check** - ensure the package compiles correctly
6. **Clear commit messages** - describe what the key is for

## Validation Checklist

Before committing, verify:

- [ ] Key added to `src/types.ts` TranslationKeys enum
- [ ] English translation added to `src/en/index.ts`
- [ ] Key added to all 10 other language files
- [ ] `npx tsc -b` passes without errors
- [ ] `npm run build` completes successfully
- [ ] Commit message follows the format

## Reference

For more details about the project structure and guidelines, see `@AGENTS.md`.
