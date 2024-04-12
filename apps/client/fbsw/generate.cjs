const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env file
function loadEnv(envFile) {
    const envData = fs.readFileSync(envFile, 'utf8');
    const envVariables = {};
    envData.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVariables[key.trim()] = value.trim();
        }
    });
    return envVariables;
}

// Define modes
const modes = ['development', 'emulator', 'live'];

modes.forEach(mode => {
    console.log(`Processing mode: ${mode}`);
    
    // Load corresponding .env file based on mode from parent directory
    const envFilePath = path.resolve(__dirname, `../.env.${mode}`);
    const envVariables = loadEnv(envFilePath);

    // Read firebase-messaging-sw.js file
    const jsFilePath = path.resolve(__dirname, 'firebase-messaging-sw.js');
    let jsData = fs.readFileSync(jsFilePath, 'utf8');

    // Replace references to environment variables in the JavaScript file
    Object.entries(envVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        jsData = jsData.replace(regex, value);
    });

    // Write modified JavaScript file to output file
    const outputFilePath = path.resolve(__dirname, `firebase-messaging-sw.${mode}.js`); // Adjust output file name
    fs.writeFileSync(outputFilePath, jsData);

    console.log(`Output file generated for mode: ${mode}`);
});
