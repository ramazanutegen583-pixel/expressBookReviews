const express = require('express');
const jwt = require('jsonwebtoken');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const books = require('./booksdb.js');
const authenticated = express.Router();
const users = new Map();
const signingKey = randomBytes(32);

function validCredentials(username, password) {
  return typeof username === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(username)
    && typeof password === 'string' && password.length > 0 && password.length <= 128;
}

function register(req, res) {
  const { username, password } = req.body ?? {};
  if (!validCredentials(username, password)) {
    return res.status(400).json({ message: 'Provide a valid username and password' });
  }
  if (users.has(username)) {
    return res.status(409).json({ message: 'Username already registered' });
  }
  const salt = randomBytes(16);
  users.set(username, { salt, hash: scryptSync(password, salt, 64) });
  return res.status(201).json({ message: 'User successfully registered' });
}

authenticated.post('/login', (req, res, next) => {
  const { username, password } = req.body ?? {};
  const user = users.get(username);
  if (!validCredentials(username, password) || !user
    || !timingSafeEqual(user.hash, scryptSync(password, user.salt, 64))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  return req.session.regenerate((error) => {
    if (error) return next(error);
    req.session.accessToken = jwt.sign({ username }, signingKey, { expiresIn: '1h' });
    return res.json({ message: 'Login successful' });
  });
});

function authorize(req, res, next) {
  if (!req.session.accessToken) {
    return res.status(401).json({ message: 'Log in to manage reviews' });
  }
  try {
    const { username } = jwt.verify(req.session.accessToken, signingKey, { algorithms: ['HS256'] });
    req.username = username;
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
  return next();
}

authenticated.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  const review = req.body?.review ?? req.query.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Provide a review' });
  }
  const { reviews } = books[isbn];
  const updating = Object.hasOwn(reviews, req.username);
  reviews[req.username] = review.trim();
  return res.json({ message: updating ? 'Review updated successfully' : 'Review added successfully', reviews });
});

authenticated.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  const { reviews } = books[isbn];
  if (!Object.hasOwn(reviews, req.username)) {
    return res.status(404).json({ message: 'Review not found' });
  }
  delete reviews[req.username];
  return res.json({ message: 'Review deleted successfully', reviews });
});

module.exports = { authenticated, authorize, register };
