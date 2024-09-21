const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');
const Movie = require('../models/movie.model');
const axios = require('axios');
const { getCache, setCache } = require('../utils/cache');
const { set } = require('mongoose');

//@desc Register a new user
//@route POST /api/users/register
//@access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password} = req.body;

    //Check if user already exists
    const userExists = await User.findOne({email});

    if(userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    //Create new user
    const user = await User.create({
        name,
        email,
        password //Password hasing handled in the User model's pre-save middleware
    });

    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }else{
        res.status(400);
        throw new Error('Invalid user data');
    }
} );

// @desc Authenticate a user & get token
// @route POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
    console.log("Hey we are here",req.body);
    const { email, password } = req.body;

    //Find user by Email
    const user = await User.findOne({ email}).select('+password'); //Include Password

    if(user && (await user.matchPassword(password))){
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }else{
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if(user){
        res.status(200).json(user);
    }else{
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc Save a movie to user's collection
// @route POST /api/users/saved-movies
// @access Private
const saveMovie = asyncHandler(async (req, res) => {
    
    const { imdbId } = req.body;
    
    if(!imdbId){
        res.status(400);
        throw new Error('Movie(IMDBId) ID is required');
    }
 // Check cache first
    let movie = getCache(imdbID);
    //Check if the movie already exists in the database
    
    if(!movie){
        
        movie = await Movie.findOne({imdbId});
        if(!movie){
            const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`);

            if(response.data.Response === 'False') {
                res.status(404);
                throw new Error('Movie not found in OMDB');
            }
    
            //Create a new Movie Document and save
            movie = await Movie.create({
                imdbId: response.data.imdbID,
                title: response.data.Title,
                director: response.data.Director,
                genre: response.data.Genre,
                releaseYear: parseInt(response.data.Year) || 0,
                rating: parseFloat(response.data.imdbRating) || 0,
                description: response.data.Plot,
                poster: response.data.Poster,
                runtime: response.data.Runtime,
            });

            // Cache the movie details
            setCache(imdbId, movie);
        }
        
    }

    //Check if the movie is already saved by the user
    if(req.user.savedMovies.includes(movie._id)){
        res.status(400);
        throw new Error('Movie already saved');
    }

    //Add movie to User's saved movies
    req.user.savedMovies.push(movie._id);
    await req.user.save();

    //Optionally, add user to movie's users array
    movie.users.push(req.user._id);
    await movie.save();
    
    res.status(200).json({ message: 'Movie saved successfully', movie });
})

// @desc Remove a movie from User's collection
// @route DELETE /api/users/saved-movies/:imdbId
// @access Private
const removeSavedMovie = asyncHandler(async (req, res) => {
    
    const { imdbId } = req.params;

    if(!imdbId){
        res.status(400);
        throw new Error('Movie(IMDBId) ID is required');
    }

    //Find the movie by imdbId
    const movie = await Movie.findOne({ imdbId});

    if(!movie){
        res.status(404);
        throw new Error('Movie not found');
    }

    //Check if the movie is saved by the user
    if(!req.user.savedMovies.includes(movie._id)){
        res.status(400);
        throw new Error('Movie not saved by the user');
    }

    //Remove movie from user's saved movies
    req.user.savedMovies = req.user.savedMovies.filter(
        (id) => id.toString() !== movie._id.toString()
    );
    await req.user.save();

    //Optionally, remove user from movie's users array
    movie.users = movie.users.filter(
        (id) => id.toString() !== req.user._id.toString()
    );
    await movie.save();
    
    res.status(200).json({ message: 'Movie removed from saved collection', movie });
})

// @desc Get user's saved movies
// @route GET /api/users/saved-movies
// @access Private
const getSavedMovies = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('savedMovies');

    if(!user){
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json(user.savedMovies);
})

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    saveMovie,
    removeSavedMovie,
    getSavedMovies
}