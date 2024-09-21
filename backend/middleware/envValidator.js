const dotenv = require('dotenv');

const envValidator = () => {
    const requiredEnvVars = [
        'PORT',
        'MONGO_URI',
        'NODE_ENV'
    ];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if(missingVars.length > 0) {
        console.log(`Missing environment variables: ${missingVars.join(', ')}`);
        process.exit(1); // Exit the application with a failure code
    }
}

module.exports = envValidator

