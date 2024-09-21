const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Movie = require('../models/movie.model');
const User = require('../models/user.model');

//@desc Fetch and save a movie by title from OMDB
//@route POST /api/movies/fetch-by-title
//@access Public

const fetchMovieByTitle = async(req, res, next) => {
    try {
        const { title } = req.body;

        if(!title){
            res.status(400).json({message: 'Title is required'});
            throw new Error('Title is required');
        }

        //Check if the movie already exists
        let movie = await Movie.findOne({ title: new RegExp(`^${title}$`, 'i')});

        if(movie){
            return res.status(200).json({ message: 'Movie already exists', movie });
        }

        //Fetch From OMDB API
        const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.OMDB_API_KEY}`);

        if(response.data.Response === 'False') {
            res.status(404).json({message: 'Movie not found'});
            throw new Error('Movie not found');
        }

        //Create a new Movie Document and save
        movie = new Movie({
            imdbId: response.data.imdbID,
            title: response.data.Title,
            director: response.data.Director,
            genre: response.data.Genre,
            releaseYear: parseInt(response.data.Year) || 0,
            rating: parseFloat(response.data.imdbRating) || 0,
            description: response.data.Plot,
            poster: response.data.Poster,
            runtime: response.data.Runtime
        });

        await movie.save();
        res.status(200).json({ message: 'Movie fetched and saved', movie });
    } catch (error) {
        next(error);
    }
}

// @desc Fetch and save a movie by IMDB ID from OMDB
// @route POST /api/movies/fetch
// @access Private
const fetchAndSaveMovie = asyncHandler(async (req, res) => {
    const { imdbId } = req.body;

    if(!imdbId){
        res.status(400);
        throw new Error('Movie(IMDBId) ID is required');
    }

    //Check if the movie already exists
    let movie = await Movie.findOne({imdbId});

    if(movie){
        res.status(200).json({ message: 'Movie already exists', movie });
        return;
    }

    //Fetch Movie Details from OMDB API
    const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`);
    if(response.data.Response === 'False') {
        res.status(404);
        throw new Error('Movie not found in OMDB');
    }

    //Create and Save Movie
    movie = await Movie.create({
        imdbId: response.data.imdbID,
        title: response.data.Title,
        director: response.data.Director,
        genre: response.data.Genre,
        releaseYear: parseInt(response.data.Year) || 0,
        rating: parseFloat(response.data.imdbRating) || 0,
        description: response.data.Plot,
        poster: response.data.Poster,
        runtime: response.data.Runtime
    });

    res.status(200).json({ message: 'Movie fetched and saved Successfully', movie });
})

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = asyncHandler(async (req, res) => {
    const movies = await Movie.find({});

    res.status(200).json({ movies });
})

// @desc    Get a movie by ID
// @route   GET /api/movies/:id
// @access  Public

const getMovieById = asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id).populate('users', 'name email');

    if(!movie){
        res.status(404);
        throw new Error('Movie not found');
    }

    res.status(200).json( movie );
})

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie){
        res.status(404);
        throw new Error('Movie not found');
    }
    const { title, director, genre, releaseYear, rating, description, poster, runtime } = req.body;

    movie.title = title || movie.title;
    movie.director = director || movie.director;
    movie.genre = genre || movie.genre;
    movie.releaseYear = releaseYear || movie.releaseYear;
    movie.rating = rating !== undefined ? rating : movie.rating;
    movie.description = description || movie.description;
    movie.poster = poster || movie.poster;
    movie.runtime = runtime || movie.runtime;

    const updatedMovie = await movie.save();

    res.status(200).json(updatedMovie);

})

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie){
        res.status(404);
        throw new Error('Movie not found');
    }

    await movie.remove();
    res.status(200).json({ message: 'Movie deleted successfully' });
})
module.exports = {
    fetchAndSaveMovie,
    getMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    fetchMovieByTitle
}