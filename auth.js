const db = require("./db");
const { User } = db.models;
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");


/**
 * Middleware for authenticating users
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will set the user on the request and call next(). If it throws, it will either warn a credential error or deny access.
 */
const authenticateUser = async (req, res, next) => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {
    const user = await User.findOne( { where: { emailAddress: credentials.name } } );

    // If a user was successfully retrieved from the database...
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );

      // If the passwords match...
      if (authenticated) {

        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: "Access Denied" });
  } else {
    // Call the next() method.
    next();
  }
};

module.exports = authenticateUser;