// tests/user.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../server'); // Adjust the path if necessary
const User = require('../models/user.model');

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
  await User.deleteMany();
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('john@example.com');
  });

  it('should not register a user with an existing email', async () => {
    // First, create a user
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    // Attempt to register with the same email
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should authenticate a user and return a token', async () => {
    // First, create a user
    await User.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    // Attempt to login
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'alice@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('alice@example.com');
  });

  it('should not authenticate with incorrect password', async () => {
    // First, create a user
    await User.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
    });

    // Attempt to login with wrong password
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'bob@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  // Add more tests as needed
});
