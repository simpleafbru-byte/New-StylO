const app = require('../server.js');

module.exports = (req, res) => {
  if (req.originalUrl && req.url !== req.originalUrl) {
    req.url = req.originalUrl;
  }
  return app(req, res);
};
