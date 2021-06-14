export default (req, res, next) => {
  console.info(req.method, req.url);
  next();
};
