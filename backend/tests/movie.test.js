// tests/movie.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../server'); // Adjust the path if necessary
const Movie = require('../models/movie.model');

dotenv.config();

// Connect to a separate test database before running tests
beforeAll(async () => {
  const db = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/movie-search-test';
  await mongoose.connect(db, {
    // No need for useNewUrlParser or useUnifiedTopology in Mongoose v6+
  });
});

// Clean up database after each test
afterEach(async () => {
  await Movie.deleteMany();
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Movie API Endpoints', () => {
  it('should fetch and save a movie successfully', async () => {
    // Mock user authentication by setting a valid token
    const token = 'your_valid_jwt_token_here'; // Replace with a valid token or mock authentication

    const res = await request(app)
      .post('/api/movies/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        imdbId: 'tt1375666', // IMDb ID for "Inception"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Movie fetched and saved successfully');
    expect(res.body.movie).toHaveProperty('title', 'Inception');
  });

  it('should not save a movie without imdbID', async () => {
    const token = 'your_valid_jwt_token_here'; // Replace with a valid token or mock authentication

    const res = await request(app)
      .post('/api/movies/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Movie(IMDBId) ID is required');
  });

  // Add more tests as needed
});
