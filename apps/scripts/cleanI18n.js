const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function analyzeTranslations() {
  // 1. Load and parse the translation file
  const localePath = path.join(__dirname, '../client/src/hooks/I18n/locales/en.json');
  let translations = {};
  try {
    translations = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  } catch (e) {
    console.error(`Error loading translation file: ${e.message}`);
    process.exit(1);
  }

  // 2. Get all translation keys (including nested ones)
  const translationKeys = new Set(getAllKeys(translations));
  console.log(`Found ${translationKeys.size} translation keys in JSON file`);

  // 3. Find all message IDs used in source files
  const filesWithMissingKeys = new Map(); // Stores filePath => {key: lineNumbers[]}
  const sourceFiles = await glob([
    '../client/src/**/*.{js,jsx,ts,tsx}',
    '../src/**/*.{ts,tsx}'
  ], {
    ignore: ['**/node_modules/**'],
    absolute: true,
    cwd: __dirname
  });

  console.log(`Scanning ${sourceFiles.length} source files...`);

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    
    // Find all message IDs with their line numbers
    const messageLocations = findMessageIdsWithLocations(content);
    
    // Filter for missing keys and group by file
    messageLocations.forEach(({id, lineNumber}) => {
      if (!translationKeys.has(id)) {
        if (!filesWithMissingKeys.has(relativePath)) {
          filesWithMissingKeys.set(relativePath, new Map());
        }
        const fileEntries = filesWithMissingKeys.get(relativePath);
        if (!fileEntries.has(id)) {
          fileEntries.set(id, []);
        }
        fileEntries.get(id).push(lineNumber);
      }
    });
  }

  // 4. Report missing translations grouped by file
  if (filesWithMissingKeys.size > 0) {
    console.log('\n=== Files with missing translation keys ===');
    filesWithMissingKeys.forEach((missingKeys, filePath) => {
      console.log(`\n${filePath}:`);
      missingKeys.forEach((lineNumbers, key) => {
        const linesStr = lineNumbers.join(', ');
        console.log(`  - ${key} (lines: ${linesStr})`);
      });
    });
  } else {
    console.log('\nAll message IDs in code have matching translation keys');
  }

  // 5. Get all used message IDs across all files
  const allUsedIds = new Set();
  const allSourceFiles = await glob([
    '../client/src/**/*.{js,jsx,ts,tsx}',
    '../src/**/*.{ts,tsx}'
  ], {
    ignore: ['**/node_modules/**'],
    absolute: true,
    cwd: __dirname
  });

  for (const file of allSourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    findMessageIds(content).forEach(id => allUsedIds.add(id));
  }

  // 6. Report unused translations (in JSON but not in code)
  const unusedTranslations = [...translationKeys].filter(key => !allUsedIds.has(key));
  if (unusedTranslations.length > 0) {
    console.log('\n=== Unused translation keys (in JSON but not in code) ===');
    unusedTranslations.forEach(key => console.log(key));
  } else {
    console.log('\nAll translation keys are being used');
  }
}

// Get all keys from nested translation object
function getAllKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...keys, ...getAllKeys(obj[key], fullKey)];
    }
    return [...keys, fullKey];
  }, []);
}

// Find all message IDs in source code (returns just IDs)
function findMessageIds(content) {
  const foundIds = new Set();
  
  // FormattedMessage components
  const formattedMessageRegex = /<FormattedMessage[^>]*\sid\s*=\s*{?\s*["'`](.+?)["'`]\s*}?[^>]*>/g;
  let match;
  while ((match = formattedMessageRegex.exec(content)) !== null) {
    foundIds.add(match[1]);
  }

  // formatMessage calls
  const formatMessageRegex = /(?:intl|formatMessage)\.formatMessage\(\s*{\s*[^}]*\bid\s*:\s*["'](.+?)["'][^}]*}\s*\)/g;
  while ((match = formatMessageRegex.exec(content)) !== null) {
    foundIds.add(match[1]);
  }

  return [...foundIds];
}

// Find message IDs with their line numbers
function findMessageIdsWithLocations(content) {
  const lines = content.split('\n');
  const results = [];
  
  // Patterns to detect
  const patterns = [
    {
      name: 'FormattedMessage',
      regex: /<FormattedMessage[^>]*\sid\s*=\s*{?\s*["'`](.+?)["'`]\s*}?[^>]*>/g
    },
    {
      name: 'formatMessage',
      regex: /(?:intl|formatMessage)\.formatMessage\(\s*{\s*[^}]*\bid\s*:\s*["'](.+?)["'][^}]*}\s*\)/g
    }
  ];

  patterns.forEach(({regex}) => {
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let match;
      while ((match = regex.exec(line)) !== null) {
        results.push({
          id: match[1],
          lineNumber: lineNum + 1 // Convert to 1-based numbering
        });
      }
      // Reset regex state for next line
      regex.lastIndex = 0;
    }
  });

  return results;
}

analyzeTranslations().catch(console.error);
