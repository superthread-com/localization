---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(npm run build)
description: Add key with translations
---

## Context

- Current git status: !`git status`

Reject the task if there are unstaged or uncommitted changes.

## Your task

Follow the instructions for adding a new translation key in @AGENTS.md.

The key value is: $1
The english words for this key are: $2

Ensure that you add a translation for all supported languages (listed directories in @src).

Stage and commit all modified files with a simple commit message, e.g. 'added new key $1'
