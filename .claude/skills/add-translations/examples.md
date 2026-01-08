# Translation Key Examples

This document provides examples of translation key naming patterns used in the codebase.

## Simple CamelCase Keys

Basic keys for UI elements and actions:

```typescript
inviteTeamMembersTo: "Invite team members to your workspace"
loggingIn: "Logging you in"
checkEmail: "Check your email"
signOut: "Sign out"
save: "Save"
cancel: "Cancel"
delete: "Delete"
edit: "Edit"
create: "Create"
```

## Dot Notation - Grouped by Feature

Keys organized by feature area using dots:

### Slash Commands

```typescript
slash.group.media: "Media"
slash.group.basic: "Basic"
slash.keyword.media: "media"
slash.display.attach: "Attach file"
slash.display.image: "Image"
```

### Menu Items

```typescript
menu.add-comment: "Add comment"
menu.bold: "Bold"
menu.italic: "Italic"
menu.heading: "Heading"
```

### Billing

```typescript
billing.monthly: "Monthly"
billing.yearly: "Yearly"
billing.upgrade: "Upgrade"
billing.currentPlan: "Current plan"
```

### Editor

```typescript
editor.clickToDownload: "Click to download"
editor.loading: "Loading"
editor.uploading: "Uploading"
```

## Pluralization Keys

Keys that handle singular and plural forms:

```typescript
boardsCount_one: "board";
boardsCount_other: "boards";
cardsCount_one: "card";
cardsCount_other: "cards";
```

Pattern: `{item}Count_one` and `{item}Count_other`

## Time-based Keys

Keys representing time offsets:

```typescript
now: "Now"
now+2d: "In 2 days"
now+1w: "In 1 week"
now+1M: "In 1 month"
now-1h: "1 hour ago"
now-1d: "1 day ago"
```

Pattern: `now±{number}{unit}` where unit can be:

- `h` - hours
- `d` - days
- `w` - weeks
- `M` - months
- `y` - years

## Namespaced Keys with Underscores

Keys with namespaces using underscores:

```typescript
billing.daysLeftOnTrial_one: "day left on trial"
billing.daysLeftOnTrial_other: "days left on trial"
```

## Global Namespace

Keys in global namespace:

```typescript
global.text.create: "Create"
global.label.createIn: "Create in"
global.placeholder.pagePlaceholder: "Start writing..."
```

## Keyboard Shortcuts

Keys for keyboard shortcut descriptions:

```typescript
keyboardShortcuts.title: "Keyboard shortcuts"
keyboardShortcuts.searchForAnything: "Search for anything"
keyboardShortcuts.createNewCard: "Create new card"
```

## Option Labels

Keys for dropdown and select options:

```typescript
option.label.cards: "Cards"
option.label.pages: "Pages"
option.label.boards: "Boards"
```

## Search and Messages

```typescript
search.message.noResults: "No results found"
searchPlaceholder: "Search..."
```

## Onboarding

Keys specifically for onboarding flows:

```typescript
onboarding.software_development: "Software development"
onboarding.recruitment: "Recruitment"
onboardingListTasks.committed.heading: "Committed"
onboardingQuote.0: "Quote text here"
onboardingQuoteAuthor.0: "Author name"
```

## Electron App Specific

Keys for desktop application:

```typescript
electronOpenInApp: "Open in app";
electronOpenLinksInDesktopApp: "Open links in desktop app";
electronRecentlyViewed: "Recently viewed";
```

## Calendar Integration

```typescript
calendar.all_day: "All day"
calendar.event_link: "Event link"
calendar.participants: "Participants"
```

## Webhook Notifications

```typescript
webhookNotificationCardCreatedOnBoard: "Card created on board";
webhookNotificationCardMovedToBoard: "Card moved to board";
```

## Best Practices

1. **Be consistent**: Follow existing patterns for similar features
2. **Use descriptive names**: Key names should indicate their purpose
3. **Group related keys**: Use dot notation to group by feature
4. **Consider pluralization**: Add `_one` and `_other` variants when needed
5. **Keep it concise**: Keys should be readable but not overly long
6. **Use proper separators**:
   - `.` for hierarchical grouping (feature.subfeature.action)
   - `_` for variants (pluralization, conditions)
   - No separator (camelCase) for simple single-purpose keys

## Common Patterns Summary

| Pattern                 | Example                   | Use Case           |
| ----------------------- | ------------------------- | ------------------ |
| `camelCase`             | `loginButton`             | Simple UI elements |
| `feature.action`        | `menu.bold`               | Grouped by feature |
| `feature.category.item` | `billing.category.spaces` | Deep hierarchy     |
| `item_variant`          | `boardsCount_one`         | Pluralization      |
| `now±time`              | `now+2d`                  | Time offsets       |
| `namespace.type.name`   | `global.text.create`      | Global/shared keys |
