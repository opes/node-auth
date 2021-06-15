import request from 'supertest';
import pool from '../lib/utils/pool.js';
import setup from '../data/setup.js';
import app from '../lib/app.js';
import User from '../lib/models/User.js';

const agent = request.agent(app);
const password = 'preciousmetals1';

const logIn = async (email, password) => {
  const { body } = await agent
    .post('/api/v1/session')
    .send({ email, password });
  return body;
};

const startSession = async ({ admin } = { admin: false }) => {
  const user = await User.insert({
    email: `${Date.now()}@example.com`,
    password,
    role: admin ? 'Admin' : 'User',
  });
  await logIn(user.email, password);
  return user;
};

describe('node-auth', () => {
  beforeEach(() => {
    return setup(pool, false);
  });

  afterEach(async () => {
    await agent.delete('/api/v1/session');
  });

  afterAll(() => {
    pool.end();
  });

  describe('user routes', () => {
    it('creates new user on POST', async () => {
      const { body } = await agent.post('/api/v1/users/').send({
        email: 'bilbo@shire.net',
        password,
        role: 'User',
      });
      const user = await User.findByEmail('bilbo@shire.net');

      expect(body).toEqual(user.toJSON());
    });

    describe('authentication & authorization', () => {
      describe('when logged out', () => {
        it('returns status 401 when getting a user', async () => {
          const { body } = await agent.get('/api/v1/users/1');
          expect(body.status).toBe(401);

          const user = await startSession();
          const { text } = await agent.get('/api/v1/users/1');
          expect(JSON.parse(text)).toStrictEqual(user.toJSON());
        });

        it('returns status 401 when listing users', async () => {
          const { body: userResp } = await request(app).get('/api/v1/users');
          expect(userResp.status).toBe(401);

          const user = await startSession({ admin: true });
          const { body: adminResp } = await agent.get('/api/v1/users');
          expect(adminResp).toStrictEqual([user.toJSON()]);
        });
      });

      describe('when logged in as a User', () => {
        let user;

        beforeEach(async () => {
          user = await startSession();
        });

        it('returns a user', async () => {
          const { text } = await agent.get('/api/v1/users/1');
          expect(JSON.parse(text)).toStrictEqual(user.toJSON());
        });

        it('returns 403 when listing users', async () => {
          const { status } = await agent.get('/api/v1/users');
          expect(status).toBe(403);
        });
      });

      describe('when logged in as an Admin', () => {
        let user;

        beforeEach(async () => {
          user = await startSession({ admin: true });
        });

        it('returns a user', async () => {
          const { text } = await agent.get('/api/v1/users/1');
          expect(JSON.parse(text)).toStrictEqual(user.toJSON());
        });

        it('returns a list of users', async () => {
          const { text } = await agent.get('/api/v1/users');
          expect(JSON.parse(text)).toStrictEqual([user.toJSON()]);
        });
      });
    });
  });

  describe('session routes', () => {
    it('logs in a user', async () => {
      const { email } = await User.insert({
        email: 'bilbo@shire.net',
        password,
        role: 'User',
      });

      const response = await logIn(email, password);
      expect(response.success).toBe(true);
    });

    it('logs out a user', async () => {
      const {
        body: { success },
      } = await agent.delete('/api/v1/session');

      expect(success).toBe(true);
    });
  });
});
