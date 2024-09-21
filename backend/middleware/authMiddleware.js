const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const logger = require('../utils/logger');

//Protect Routes by verifying JWT
const protect = asyncHandler(async (req, res, next) => {
    let token;

    //check for token in Authorization header
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try {
            //Get token from header
            token = req.headers.authorization.split(' ')[1];

            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //Get user from the token, exclude password
            req.user = await User.findById(decoded.id).select('-password');

            if(!req.user) {
                res.status(401);
                throw new Error('User Not Found');
            }

            next();
        } catch (error) {
            logger.error(`Authentication Error: ${error.message}`);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if(!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

//Optional: Authorize based on user role
const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role '${req.user.role}' is not authorized`);
        }
        next();
    };
}

module.exports = { protect, authorize };