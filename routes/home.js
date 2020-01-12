const router = require("express").Router();

module.exports = () => {
  router.get("/", (req, res) => res.json({ test: "testing" }));
  return router;
};
