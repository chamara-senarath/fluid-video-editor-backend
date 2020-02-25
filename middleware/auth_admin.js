let Admin = require("../models/admin");
let auth_admin = (req, res, next) => {
  let token = req.header("x-auth");

  Admin.findByToken(token)
    .then(admin => {
      if (!admin) {
        return Promise.reject();
      }
      req.admin = admin;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).send(e);
    });
};
module.exports = auth_admin;
