import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import User from '../models/User.js';

const adminOnly = [authenticate, authorize(['Admin', 'User'])];

export default Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await User.insert(req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  })
  .get('/:id', adminOnly, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.json(user ?? {});
    } catch (err) {
      next(err);
    }
  })
  .get('/', authenticate, authorize(['Admin']), async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });
