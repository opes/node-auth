import request from 'supertest';
import pool from '../lib/utils/pool.js';
import setup from '../data/setup.js';
import app from '../lib/app.js';
import User from '../lib/models/User.js';

const agent = request.agent(app);
const password = 'preciousmetals1';

// Helper method for logging in a user
const login = async (email, password) => {
  const { body } = await agent
    .post('/api/v1/session')
    .send({ email, password });
  return body;
};

// Helper method for creating a user and logging them in
const startSession = async ({ admin } = { admin: false }) => {
  const user = await User.insert({
    email: `${Date.now()}@example.com`,
    password,
    role: admin ? 'Admin' : 'User',
  });
  await login(user.email, password);
  return user;
};

describe('node-auth', () => {
  beforeEach(() => {
    // Setup our database before each test
    return setup(pool, false);
  });

  afterEach(async () => {
    // Log out the user after each test
    await agent.delete('/api/v1/session');
  });

  afterAll(() => {
    // Close the DB connection after all tests are run
    pool.end();
  });

  describe('/api/v1/users', () => {
    it('creates new user via POST /', async () => {
      const { body } = await agent.post('/api/v1/users/').send({
        email: 'bilbo@shire.net',
        password,
        role: 'user', // Case-insensitive, has to be a key in UserRoles
      });
      const user = await User.findByEmail('bilbo@shire.net');

      expect(body).toEqual(user.toJSON());
    });

    describe('authentication & authorization', () => {
      describe('when logged out', () => {
        it('returns status 401 when getting a user via GET /:id', async () => {
          const { body } = await agent.get('/api/v1/users/1');
          expect(body.status).toBe(401);
        });

        it('returns status 401 when listing users via GET /', async () => {
          const { body } = await request(app).get('/api/v1/users');
          expect(body.status).toBe(401);
        });

        it('returns status 401 when updating a user via PATCH /:id', async () => {
          const { body } = await request(app)
            .patch('/api/v1/users/1')
            .send({ email: 'not-signed-in@example.com' });
          expect(body.status).toBe(401);
        });
      });

      describe('when logged in as a User', () => {
        let user;

        beforeEach(async () => {
          // Log in a new user at the start of each test
          user = await startSession();
        });

        it('returns a user via GET /:id', async () => {
          const { text } = await agent.get(`/api/v1/users/${user.id}`);
          expect(JSON.parse(text)).toStrictEqual(user.toJSON());
        });

        it('returns a list of users via GET /', async () => {
          const { text } = await agent.get('/api/v1/users');
          expect(JSON.parse(text)).toStrictEqual([user.toJSON()]);
        });

        it('returns a 403 when trying to update a user via PATCH /:id', async () => {
          const { status } = await agent
            .patch(`/api/v1/users/${user.id}`)
            .send({ email: 'updated@example.com' });
          expect(status).toBe(403);
        });
      });

      describe('when logged in as an Admin', () => {
        let user;

        beforeEach(async () => {
          // Log in a new Admin user at the start of each test
          user = await startSession({ admin: true });
        });

        it('returns a user via GET /:id', async () => {
          const { text } = await agent.get('/api/v1/users/1');
          expect(JSON.parse(text)).toStrictEqual(user.toJSON());
        });

        it('returns a list of users via GET /', async () => {
          const { text } = await agent.get('/api/v1/users');
          expect(JSON.parse(text)).toStrictEqual([user.toJSON()]);
        });

        it('returns an updated user via PATCH /:id', async () => {
          const email = 'updated@example.com';
          const { text } = await agent
            .patch(`/api/v1/users/${user.id}`)
            .send({ email });
          expect(JSON.parse(text)).toStrictEqual({
            ...user.toJSON(),
            email,
          });
        });
      });
    });
  });

  describe('/api/v1/session', () => {
    it('logs in a user via POST /', async () => {
      const { email } = await User.insert({
        email: 'bilbo@shire.net',
        password,
        role: 'User',
      });

      const response = await login(email, password);
      expect(response.success).toBe(true);
    });

    it('logs out a user via DELETE /', async () => {
      const {
        body: { success },
      } = await agent.delete('/api/v1/session');

      expect(success).toBe(true);
    });
  });
});
