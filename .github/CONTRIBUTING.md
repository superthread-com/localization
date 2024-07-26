# Contributing to @superthread-com/localization

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to our project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## How Can I Contribute?

### Adding a New Language

This section guides you through adding a new language to the project.

1. **Create an Issue**:
   - **Perform a [cursory search](https://github.com/superthread-com/localization/issues)** to see if the language request has already been reported.
   - Before adding a new language, create an issue to discuss it.

   - Use the following format for the issue title: `[language code: "native language name"]`
     - Example: `[es: "Español"]`
   - Provide a brief description of the language and any initial translation plans.

2. **Create a Language Folder**:
   - Navigate to the `src/locales` directory.
   - Create a new folder named after the language code (e.g., "es" for Spanish, "de" for German).

3. **Add `index.ts`**:
   - Inside the newly created folder, add an `index.ts` file.
   - Use keys from the existing type definitions and add translations as values.
   - Example structure for `index.ts`:

     ```typescript
     import { Translations } from '../types';

     const translations: Translations = {
       key1: 'translation1',
       key2: 'translation2',
       // Add all necessary translations here
     };

     export default translations;
     ```

4. **Test Your Translations**:
   - Ensure that your translations are accurate and contextually correct.
   - You may use tools or native speakers for verification.
   - Run `npm run prepack` to ensure that your translations are correctly formatted and all the keys added to the language file.

### Contributing to Existing Languages

1. **Locate the Language Folder**:
   - Navigate to the `src/` directory and find the folder for the language you want to contribute to (e.g., "es" for Spanish, "de" for German).

2. **Edit `index.ts`**:
   - Open the `index.ts` file in the relevant language folder.
   - Add new keys from the existing type definitions and provide the corresponding translation values.
   - Example structure for adding new translations:

     ```typescript
     import { Translations } from '../types';

     const translations: Translations = {
       existingKey1: 'existingTranslation1',
       existingKey2: 'existingTranslation2',
       newKey1: 'newTranslation1',
       newKey2: 'newTranslation2',
       // or using types for keys
       [Translations.ExistingKey3]: 'existingTranslation3',
     };

     export default translations;
     ```

3. **Test Your Translations**:
   - Ensure that your translations are accurate and contextually correct.
   - You may use tools or native speakers for verification.
   - Run `npm run prepack` to ensure that your translations are correctly formatted and all the keys added to the language file.

### Pull Requests

- **Branch Naming**:
  - Name your branch in the following format: `languagecode_developerusername_addkey/editkey`
    - Example: `es_johndoe_addkey` or `de_janedoe_editkey`

- **Pull Request Process**:
  - Ensure any install or build dependencies are removed before the end of the layer when doing a build.
  - You may merge the Pull Request once you have the approval of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

Thank you for considering contributing to our project!
