import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import User from '../models/User.js';

const adminOnly = [authenticate, authorize(['Admin'])];

export default Router()
  // Create a user
  .post('/', async (req, res, next) => {
    try {
      const user = await User.insert(req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  })
  // Get a user by ID (requires a signed in user)
  .get('/:id', authenticate, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.json(user ?? {});
    } catch (err) {
      next(err);
    }
  })
  // List all users (requires 'Admin' role)
  .get('/', adminOnly, async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });
