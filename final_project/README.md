# Express Book Reviews

This local practice app starts with the book catalog from the IBM Developer Skills Network template. Accounts, sessions, and reviews are stored in memory and reset when the server restarts.

Run the app with Node.js and pnpm:

```sh
pnpm install --frozen-lockfile
node index.js
```

The server listens on `http://127.0.0.1:5000` by default. Set `HOST` and `PORT` to use a different address.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/` | Full catalog |
| GET | `/isbn/:isbn` | One book |
| GET | `/author/:author` | Books by author |
| GET | `/title/:title` | Books by title |
| GET | `/review/:isbn` | Reviews for a book |
| POST | `/register` | Create a practice account with JSON `username` and `password` |
| POST | `/customer/login` | Log in with the same credentials and save the returned session cookie |
| PUT | `/customer/auth/review/:isbn` | Add or update your review with the session cookie and JSON `review` |
| DELETE | `/customer/auth/review/:isbn` | Delete your review with the session cookie |
