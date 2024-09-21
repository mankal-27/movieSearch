const express = require('express');
const router = express.Router();
const{
    registerUser,
    authUser,
    getUserProfile,
    saveMovie,
    removeSavedMovie,
    getSavedMovies
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validateMovie = require('../middleware/validateMovie'); 
const validateRegister = require('../middleware/validateRegister');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authUser);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   POST /api/users/saved-movies
// @desc    Save a movie to user's collection
// @access  Private
// @route   GET /api/users/saved-movies
// @desc    Get all saved movies of the user
// @access  Private
router
  .route('/saved-movies')
  .post(protect, validateMovie, saveMovie)
  .get(protect, getSavedMovies);

// @route   DELETE /api/users/saved-movies/:imdbID
// @desc    Remove a movie from user's collection
// @access  Private
router
  .route('/saved-movies/:imdbID')
  .delete(protect, removeSavedMovie);




module.exports = router;