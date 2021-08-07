import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import User, { UserRoles } from '../models/User.js';

const adminOnly = [authenticate, authorize([UserRoles.admin])];

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
  // List all users (requires a signed in user)
  .get('/', authenticate, async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  })
  // Update user (requires a user with an 'Admin' role)
  .patch('/:id', adminOnly, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      await user.update(req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });
