const fs = require('fs');
const readline = require('readline');

// Load communities.json
const jsonFilePath = './communities.json';

// Read the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }
  
  // Parse JSON data
  const communities = JSON.parse(data);
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Prompt the user to enter field name and value
  rl.question('Enter field name: ', (fieldName) => {
    rl.question('Enter substring: ', (substring) => {
      // Find records where the field value contains the substring
      const results = findSubstringMatches(communities, fieldName, substring);
      
      // Display results
      console.log('Matching records:');
      console.log(results);

      // Close the readline interface
      rl.close();
    });
  });
});

// Function to find records where field value contains the substring
function findSubstringMatches(data, fieldName, substring) {
  // Convert substring and field value to lowercase for case-insensitive comparison
  const lowerCaseSubstring = substring.toLowerCase();
  const lowerCaseFieldName = fieldName.toLowerCase();

  // Filter data based on substring match
  return data.filter(item => {
    // Convert field value to lowercase
    const fieldValue = item[lowerCaseFieldName];
    // Check if field value contains the substring
    return fieldValue && fieldValue.toLowerCase().includes(lowerCaseSubstring);
  });
}
