const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Listen for Connection events
        mongoose.connection.on('connected', () => {
            logger.info(`MongoDB Connected: ${conn.connection.host}`);
        })

        mongoose.connection.on('error', (err) => {
            logger.error(`Error connecting to database: ${err.message}`);
        })

        mongoose.connection.on('disconnected', () => {
            logger.warn(`Mongoose Disconnected`);
        })
    } catch (error) {
        logger.error(`Error connecting to database: ${error.message}`);
        process.exit(1); //Exit process with failure
    }
}

module.exports = connectDB; 