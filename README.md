# Node.js Authentication
A simple example using Express, PostgreSQL, and JWTs in HttpOnly cookies.

### Getting Started

#### Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [PostgreSQL](https://www.postgresql.org/download/)

Once all prerequisites are installed, run the following in your terminal:

```bash
git clone git@github.com:opes/node-auth.git
cd node-auth
npm i
npm run setup-db
npm run start:watch
```

### Usage
Create a user by `POST`ing to the `/api/v1/users` endpoint:
```bash
curl -d '{"email":"user@example.com","password":"hunter2"}' -H 'Content-Type: application/json' http://localhost:3000/api/v1/users
```

Log in by `POST`ing the `email` and `password` to the `/api/v1/auth/login` endpoint:
```bash
curl -d '{"email":"user@example.com","password":"hunter2"}' -H 'Content-Type: application/json' http://localhost:3000/api/v1/auth/login
```

Once logged in, you'll be able to access the following routes:
```
GET /api/v1/users
GET /api/v1/users/:id
```

Any additional routes can use the `ensureAuth` middleware to require authentication:
```js
// in some controller
import { Router } from 'express';
import ensureAuth from '../middleware/ensure-auth.js';

export default Router()
  // add the `ensureAuth` middleware to the route handler
  .get('/', ensureAuth, async (req, res, next) => {
    res.send("if you see this, you're logged in");
  });

```

### Testing

```bash
npm run test:watch
```
