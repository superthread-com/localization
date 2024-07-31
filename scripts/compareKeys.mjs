import { TranslationKeys } from '../index.js';
import getDirectoryNames from './getDirectories.mjs';

const printMissingKeys = async () => {
  const languageFolders = await getDirectoryNames('languages');
  for (const language of languageFolders) {
    const missingKeys = await getMissingKeys(language);
    if (missingKeys.length) {
      console.log(
        `\nMissing keys ${missingKeys.length} in ${language}:`,
        missingKeys
      );
    }
  }
};

const getMissingKeys = async (language) => {
  const { default: translations } = await import(
    `../languages/${language}/index.js`
  );
  return Object.values(TranslationKeys).filter(
    (key) => !Object.keys(translations).includes(key)
  );
};

export { printMissingKeys, getMissingKeys };
