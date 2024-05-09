const fs = require('fs');

function getObjectKeys(jsonFilePath) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath));
        return Object.keys(jsonData);
    } catch (error) {
        console.error(`Error reading JSON file ${jsonFilePath}: ${error.message}`);
        return [];
    }
}

function findKeyDifference(file1, file2) {
    const keys1 = getObjectKeys(file1);
    const keys2 = getObjectKeys(file2);

    const keysOnlyInFile1 = keys1.filter(key => !keys2.includes(key));
    const keysOnlyInFile2 = keys2.filter(key => !keys1.includes(key));

    console.log(`Keys only in ${file1}:`, keysOnlyInFile1);
    console.log(`Keys only in ${file2}:`, keysOnlyInFile2);
}

// Check if filenames are provided as command-line arguments
if (process.argv.length !== 4) {
    console.error('Usage: node script.js <file1.json> <file2.json>');
    process.exit(1);
}

// Get filenames from command-line arguments
const file1 = process.argv[2];
const file2 = process.argv[3];

findKeyDifference(file1, file2);
