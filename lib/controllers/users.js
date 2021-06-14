import { Router } from 'express';
import ensureAuth from '../middleware/ensure-auth.js';
import User from '../models/User.js';

export default Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await User.insert(req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  })
  .get('/:id', ensureAuth, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.json(user ?? {});
    } catch (err) {
      next(err);
    }
  })
  .get('/', ensureAuth, async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });
