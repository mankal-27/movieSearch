const express = require('express');
const router = express.Router();

const {
    fetchAndSaveMovie,
    getMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    fetchMovieByTitle, //Import the new controller function
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateMovie = require('../middleware/validateMovie');

// @route   GET /api/movies
// @desc    Get all movies
// @access  Public
router.get('/', getMovies);

// @route   GET /api/movies/:id
// @desc    Get a single movie by ID
// @access  Public
router.get('/:id', getMovieById);

// @route   POST /api/movies/fetch
// @desc    Fetch and save a movie by IMDb ID from OMDb
// @access  Private
router.post('/fetch', protect, validateMovie, fetchAndSaveMovie);

// @route   PUT /api/movies/:id
// @desc    Update a movie
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), validateMovie, updateMovie);

// @route   DELETE /api/movies/:id
// @desc    Delete a movie
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteMovie);

//Put /api/movies/fetch-by-title - fetch and save a movie by title from OMDB
router.post('/fetch-by-title', fetchMovieByTitle);


module.exports = router;