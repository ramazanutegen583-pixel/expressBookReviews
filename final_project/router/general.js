const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { register } = require('./auth_users.js');
const general = express.Router();

general.post('/register', register);
general.get('/', (req, res) => res.json(books));

general.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.json(books[isbn]);
});

function findBooks(field, value) {
  const query = value.trim().toLowerCase();
  return Object.fromEntries(
    Object.entries(books).filter(([, book]) => book[field].toLowerCase() === query)
  );
}

general.get('/author/:author', (req, res) => {
  return res.json(findBooks('author', req.params.author));
});

general.get('/title/:title', (req, res) => {
  return res.json(findBooks('title', req.params.title));
});

general.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.json(books[isbn].reviews);
});

// Run these requests against an Express Book Reviews server.
function createBookClient(baseURL = 'http://127.0.0.1:5000') {
  const api = axios.create({ baseURL, timeout: 5000 });

  return {
    async getAllBooks() {
      const { data } = await api.get('/');
      return data;
    },

    async getBookByISBN(isbn) {
      const { data } = await api.get(`/isbn/${encodeURIComponent(isbn)}`);
      return data;
    },

    async getBooksByAuthor(author) {
      const { data } = await api.get(`/author/${encodeURIComponent(author)}`);
      return data;
    },

    async getBooksByTitle(title) {
      const { data } = await api.get(`/title/${encodeURIComponent(title)}`);
      return data;
    },
  };
}

module.exports = { general, createBookClient };
