# Node.js Authentication & Role-based Authorization API
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
Create users by `POST`ing to the `/api/v1/users` endpoint with an `email`, `password`, and `role` (currently supports `Admin` or `User`):
```bash
# Create an Admin user
curl -d '{"email":"admin@example.com","password":"hunter2","role":"Admin"}' -H 'Content-Type: application/json' http://localhost:3000/api/v1/users

# Create a standard user
curl -d '{"email":"user@example.com","password":"hunter2","role":"User"}' -H 'Content-Type: application/json' http://localhost:3000/api/v1/users
```

Log in by `POST`ing the `email` and `password` to the `/api/v1/session` endpoint:
```bash
curl -d '{"email":"user@example.com","password":"hunter2"}' -H 'Content-Type: application/json' http://localhost:3000/api/v1/session
```

Once logged in, you'll be able to access the following routes:
```
GET /api/v1/users (only available to the Admin role)
GET /api/v1/users/:id
```

Any additional routes can use the `authenticate` middleware to require authentication:
```js
// in some controller
import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';

export default Router()
  // add the `authenticate` middleware to the route handler
  .get('/', authenticate, async (req, res, next) => {
    res.send("if you see this, you're logged in");
  });
```

To make a route only available to certain roles, use the `authorize` middleware:
```js
// in some controller
import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

// you can add the `authenticate` and `authorize` middlewares to an array
const ensureAdmin = [authenticate, authorize(['Admin'])]

export default Router()
  // ...then add the middleware array to the route handler
  .get('/', ensureAdmin, async (req, res, next) => {
    res.send("if you see this, you're logged in as an Admin");
  });
```

### Testing

```bash
npm run test:watch
```
