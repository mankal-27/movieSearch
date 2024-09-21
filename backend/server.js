const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConfig');
const movieRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes.js');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const cors = require('cors');
const helmet = require('helmet');   
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const compression = require('compression');

//Load Environment Variables from .env file
dotenv.config();

//Validate required environment variables
const envValidator = require('./middleware/envValidator');
envValidator();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

//Connect to Database
connectDB();

//Initialize Express app
const app = express();




// 1. Security Middleware
app.use(helmet());
//CORS Configuration
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'https://another-allowed-domain.com'], // Specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies and other credentials
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
}));
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//Prevent HTTP Parameter pollution
app.use(hpp());


// 2. Performance Middleware
app.use(compression());
app.use(generalLimiter); //Apply general rate limiter to all requests


// 3. Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 4. Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// 5. Routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/users', userRoutes);


// 6. Error Handler Middleware
//404 Middleware
app.use(notFound);
app.use(errorHandler);


/// Start the Server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
  
    // Handle unhandled promise rejections and SIGTERM
    process.on('unhandledRejection', (err, promise) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
});

module.exports = server;}