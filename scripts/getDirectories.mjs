import fs from "fs/promises";

async function getDirectoryNames(srcPath) {
  try {
    const dirEntries = await fs.readdir(srcPath, { withFileTypes: true });
    const dirNames = dirEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    return dirNames;
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

export default getDirectoryNames;
