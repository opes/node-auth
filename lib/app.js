import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Middlewares
import notFoundMiddleware from './middleware/not-found.js';
import errorMiddleware from './middleware/error.js';
import loggerMiddleware from './middleware/logger.js';

// Controllers/routes
import usersController from './controllers/users.js';
import authController from './controllers/auth.js';

const app = express();

// Dependency middleware
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());

// Custom middleware
app.use(loggerMiddleware);

// Application routes
app.use('/api/v1/auth', authController);
app.use('/api/v1/users', usersController);

// Root route
app.get('/', (req, res) => res.json({ hello: 'world' }));

// Fallback middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
