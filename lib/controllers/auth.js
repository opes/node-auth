import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

export default Router()
  .post('/login', async (req, res, next) => {
    try {
      // Get POSTed request body and find the user
      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      // If no user, or if password doesn't match, throw errors
      if (!user) throw new Error('invalid email');
      if (!bcrypt.compareSync(password, user.password))
        throw new Error('invalid password');

      // Otherwise, create the JWT to store in a httpOnly session cookie
      // and use that for identifying the current user
      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
        expiresIn: '1 day',
      });
      res.cookie(process.env.SESSION_COOKIE, token, {
        httpOnly: true,
        maxAge: ONE_DAY_IN_MS,
      });
      res.json({ success: true, message: 'logged in!' });
    } catch (err) {
      err.status = 401;
      next(err);
    }
  })
  .get('/logout', (req, res) => {
    res.clearCookie(process.env.SESSION_COOKIE);
    res.json({ success: true, message: 'logged out!' });
  });
