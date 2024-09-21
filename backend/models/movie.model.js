const mongoose = require('mongoose');

//Define the Movie schema

const movieSchema = new mongoose.Schema({
    imdbId:{
        type: String,
        required: [true, 'OMDB ID is required.'],
        unique: true,
        trim: true,
    },
    title:{
        type: String,
        required: [true, 'Movie title is required.'],
        trim: true,
    },
    director:{
        type: String,
        required: [true, 'Director name is required.'],
        trim: true,
    },
    genre:{
        type: String,
        required: [true, 'Movie genre is required.'],
        trim: true,
    },
    releaseYear:{
        type: Number,
        required: [true, 'Movie release year is required.'],
        min:[1800, 'Movie release year cannot be less than 1800.'],
        max:[new Date().getFullYear(), 'Movie release year cannot be greater than current year.'],
    },
    rating:{
        type: Number,
        min: [0, 'Movie rating cannot be less than 0.'],
        max: [10, 'Movie rating cannot be greater than 10.'],
        default: 0,
    },
    description:{
        type: String,
        trim: true, 
        maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    poster:{
        type: String, //Url to the movie poster image
        trim: true,
    },
    runtime:{
        type: String,
        trim: true,
    },
    //Optional : Associate movies with users who saved them
    users:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ]
},{timestamps: true});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;