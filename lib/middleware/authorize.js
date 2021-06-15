// When called with an array of roles (e.g. ['Admin', 'User']),
// returns a middleware function that ensures the user has one of the roles
export default (roles = []) => {
  return (req, res, next) => {
    try {
      // Check that roles were specified and that the authenticated user
      // has one of those roles
      if (roles.length && !roles.includes(req.user.role))
        throw new Error('Unauthorized');

      next();
    } catch (err) {
      err.status = 403;
      next(err);
    }
  };
};
