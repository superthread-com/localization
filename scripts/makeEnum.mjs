import writeTypes from './writeTypes.mjs';

// Function to convert string to camel case
function toCamelCase(str) {
  return str.replace(/[_-]./g, (match) => match.charAt(1).toUpperCase());
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to replace '+' with 'Plus'
function replacePlusWithPlus(str) {
  return str.replace(/\+/g, 'Plus');
}

// Function to generate the enum
function generateEnum(obj, parentKey = '') {
  let result = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      result = result.concat(generateEnum(obj[key], `${parentKey}${key}.`));
    } else {
      let enumKey = parentKey ? `${parentKey}${key}` : key;
      // Extract the original key's trailing underscores
      const originalTrailingUnderscores = key.match(/_+$/)?.[0] || '';

      enumKey = enumKey
        .split('.')
        .map(toCamelCase)
        .map(capitalizeFirstLetter)
        .map(replacePlusWithPlus) // Apply the replace function here
        .join('');

      // Correctly append the same number of underscores to the enumKey as in the original key
      enumKey = enumKey.replace(/_+$/, ''); // Remove any existing trailing underscores
      enumKey += originalTrailingUnderscores; // Append the correct number of underscores

      // Keep the enumValue intact as per the original key
      const enumValue = `${parentKey}${key}`;

      result.push(`${enumKey} = "${enumValue}"`);
    }
  }
  return result;
}

async function main() {
  // Generate the enum array and string
  console.log('Generating enum...');
  import('./temp/en/index.cjs')
    .then(({ default: input }) => {
      // Use the imported module
      const enumArray = generateEnum(input.default);
      const enumString = enumArray.join(',\n  ');

      writeTypes(enumString);
    })
    .catch((error) => {
      console.error('Failed to import:', error);
    });
}

main().catch(console.error);
