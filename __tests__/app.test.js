import pool from '../lib/utils/pool.js';
import setup from '../data/setup.js';
import request from 'supertest';
import app from '../lib/app.js';
import User from '../lib/models/User.js';

describe('node-auth', () => {
  beforeEach(() => {
    return setup(pool);
  });

  describe('user routes', () => {
    it('creates new user on POST', async () => {
      const { body } = await request(app)
        .post('/api/v1/users/')
        .send({ email: 'bilbo@shire.net', password: 'preciousmetals1' });
      const user = await User.findByEmail('bilbo@shire.net');

      expect(body).toEqual(user.toJSON());
    });
  });

  describe('auth routes', () => {
    it('logs in a user', async () => {
      const email = 'bilbo@shire.net';
      const password = 'preciousmetals1';
      await User.insert({ email, password });

      const {
        body: { success },
      } = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      expect(success).toBe(true);
    });
  });
});
