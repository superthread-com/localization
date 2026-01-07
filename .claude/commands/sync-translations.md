---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(ls:*)
---

# Sync Translations

Examine recent git changes to English translations and propagate them across all supported languages, ensuring type safety and successful builds.

## Purpose

When English translations (`src/en/index.ts`) or translation types (`src/types.ts`) are modified:

1. Identify what keys were added, modified, or removed
2. Propagate those changes to all other language files, ensuring correct translations
3. Validate TypeScript compilation
4. Ensure the build succeeds

## Supported Languages

This package supports many languages (list all directories in `src/` to get current list):

- `en` - English (source of truth)
- `bs` - Bosnian
- `de` - German
- `es` - Spanish
- `fr` - French
- `id` - Indonesian
- `ko` - Korean
- `pl` - Polish
- `pt-BR` - Portuguese (Brazil)
- `zh-Hans` - Chinese Simplified
- `zh-Hant` - Chinese Traditional

## Step-by-Step Process

### Step 1: Check Git Status

First, examine the current git status to see what files have been modified:

```bash
git status
```

Look for changes in:

- `src/types.ts` (TranslationKeys enum)
- `src/en/index.ts` (English translations)
- Any other language files

### Step 2: Examine Git Diff

View the exact changes made to understand what needs to be propagated:

```bash
git diff src/types.ts src/en/index.ts
```

Identify:

- **Added keys**: New translation keys that need to be added to all languages
- **Modified keys**: Changed translations that may need attention
- **Removed keys**: Deleted keys that should be removed from all languages
- **Value changes**: Updates to English text that should be used as placeholders in other languages

### Step 3: Get List of All Language Directories

Find all language directories to know which files to update:

```bash
ls -d src/*/
```

This will show all language directories (e.g., `src/en/`, `src/bs/`, `src/de/`, etc.)

### Step 4: Read Current State of Files

For each change identified, read the relevant sections of:

- `src/types.ts` to see the current TranslationKeys enum
- `src/en/index.ts` to see the current English translations
- Each language file to understand where to make changes

Use targeted reads with line numbers or grep to find specific keys.

### Step 5: Propagate Changes to All Languages

For each identified change:

#### For Added Keys:

1. Verify the key exists in `src/types.ts` TranslationKeys enum
2. Verify the key exists in `src/en/index.ts` with English translation
3. Add the key to all other language files and translate the value using the English translation as a source of truth
4. Maintain alphabetical or logical order consistent with English file if possible

#### For Modified Keys:

1. If the English translation text changed, update all other languages with the correct translation
2. If only formatting changed, replicate the formatting across all languages

#### For Removed Keys:

1. Remove the key from `src/types.ts` TranslationKeys enum
2. Remove the key from all language files including English

### Step 6: List All Language Files That Need Updating

Before making edits, list out all the language files that need to be modified:

```bash
ls -d src/*/
```

### Step 7: Update Each Language File

For each language file (except English, which should already be correct):

- Read the file to find the correct location for changes
- Use Edit tool to add/modify/remove the keys
- Maintain the same order as the English file
- Use English text as the source of truth for the translation

### Step 8: Validate TypeScript Compilation

After all changes are made, run TypeScript type checking:

```bash
npx tsc -b
```

If there are errors:

- Review the error messages carefully
- Common issues: missing keys, duplicate keys, type mismatches
- Fix any errors before proceeding

### Step 9: Run Build

Build the package to ensure everything compiles correctly:

```bash
npm run build
```

If the build fails:

- Review error messages
- Check for syntax errors in modified files
- Ensure all language files have matching keys

### Step 10: Summary Report

Provide a clear summary to the user:

- List of keys added/modified/removed
- Number of language files updated
- Confirmation that TypeScript compilation passed
- Confirmation that build succeeded

## Example Scenarios

### Scenario 1: New Keys Added to English

**Git diff shows**:

```diff
// src/types.ts
+ NewKey = "newKey",

// src/en/index.ts
+ newKey: "New translation text",
```

**Actions**:

1. Add `newKey: "New translation text",` to all language files
2. Place in alphabetical order matching English file
3. Validate and build

### Scenario 2: English Translation Text Changed

**Git diff shows**:

```diff
// src/en/index.ts
- loginButton: "Log in",
+ loginButton: "Sign in",
```

**Actions**:

1. Update `loginButton` in all language files to the correct translation of: "Sign in"
2. Validate and build

### Scenario 3: Key Removed

**Git diff shows**:

```diff
// src/types.ts
- OldKey = "oldKey",

// src/en/index.ts
- oldKey: "Old translation",
```

**Actions**:

1. Remove `oldKey` from all language files
2. Validate and build

### Scenario 4: Multiple Changes

**Git diff shows multiple additions and modifications**:

**Actions**:

1. Process all additions first
2. Then process all modifications
3. Then process all removals
4. Validate and build once at the end

## Important Reminders

1. **English is the source of truth** - all changes should originate from English translations
2. **Maintain order** - keep the same key order across all language files
3. **Validate before finishing** - always run TypeScript compilation and build
4. **Handle all languages** - don't skip any language files
5. **Read before editing** - always search and read parts of the file to understand context before making changes. never attempt to read the entire file. use grep to search for the relevant parts.

## Validation Checklist

Before considering the task complete, verify:

- [ ] All git changes identified and understood
- [ ] All language files updated (count should match total languages)
- [ ] Key order maintained across all files
- [ ] `npx tsc -b` passes without errors
- [ ] `npm run build` completes successfully
- [ ] Summary report provided to user

## Edge Cases

### No Changes to Propagate

If `git status` shows no changes to `src/types.ts` or `src/en/index.ts`, inform the user that there are no translation changes to propagate.

### Only Non-Translation Files Changed

If changes are only in other language files (not English), ask the user if they want to revert those to match English, or if this is intentional.

### Merge Conflicts

If there are merge conflict markers in any files, inform the user and ask them to resolve conflicts first.

### Uncommitted Changes in Non-Translation Files

Proceed with translation sync, but inform the user that there are other uncommitted changes.

## Reference

For more details about the project structure and guidelines, see `@AGENTS.md`.
