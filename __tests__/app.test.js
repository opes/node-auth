import pool from '../lib/utils/pool.js';
import setup from '../data/setup.js';
import request from 'supertest';
import app from '../lib/app.js';
import User from '../lib/models/User.js';

const createUser = async (email, password, role = 'User') => {
  const user = await User.insert({ email, password, role });
  return user;
};

const logIn = async (email, password) => {
  const { body } = await request(app)
    .post('/api/v1/session')
    .send({ email, password });
  return body;
};

describe('node-auth', () => {
  const password = 'preciousmetals1';

  beforeEach(() => {
    return setup(pool, false);
  });

  afterAll(() => {
    pool.end();
  });

  describe('user routes', () => {
    it('creates new user on POST', async () => {
      const { body } = await request(app).post('/api/v1/users/').send({
        email: 'bilbo@shire.net',
        password,
        role: 'User',
      });
      const user = await User.findByEmail('bilbo@shire.net');

      expect(body).toEqual(user.toJSON());
    });

    // TODO: Test logged in session for valid responses
    describe('authentication & authorization', () => {
      it('requires authentication for getting a user', async () => {
        const { body } = await request(app).get('/api/v1/users/1');
        expect(body.status).toBe(401);
      });

      it('requires admin authorization for listing users', async () => {
        const { body } = await request(app).get('/api/v1/users');
        expect(body.status).toBe(401);
      });
    });
  });

  describe('session routes', () => {
    it('logs in a user', async () => {
      const { email } = await createUser('bilbo@shire.net', password);

      const response = await logIn(email, password);
      expect(response.success).toBe(true);
    });
  });
});
