import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  try {
    // Check the httpOnly session cookie for the current user
    if (!req.cookies.session)
      throw new Error('You must be signed in to continue');

    // Verify the JWT token stored in the cookie, then attach to each request
    const user = jwt.verify(
      req.cookies[process.env.SESSION_COOKIE],
      process.env.JWT_SECRET
    );
    req.user = user;

    next();
  } catch (err) {
    err.status = 401;
    next(err);
  }
};
