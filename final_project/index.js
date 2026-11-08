const express = require('express');
const session = require('express-session');
const { randomBytes } = require('node:crypto');
const { authenticated, authorize } = require('./router/auth_users.js');
const { general } = require('./router/general.js');

const app = express();

app.use(express.json());

app.use('/customer', session({
  secret: randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', maxAge: 60 * 60 * 1000 },
}));
app.use('/customer/auth', authorize);
app.use('/customer', authenticated);
app.use('/', general);

const port = Number(process.env.PORT || 5000);
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`Server listening on http://${host}:${port}`));
