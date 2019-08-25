/**
 * Import database User model
 * @const User
 */
const db = require("../db");
const { User } = db.models;
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");

/**
 * Express Web Framework module
 * @requires express
 */
const express = require("express");

/**
 * Express Router
 * @method Router
 */
const router = express.Router();

// Route for current User
router.get("/users", (req, res) => {
  // Returns the currently authenticated user
  res.status(200).json({ user: "currentUser" });
});

// Route for current User
router.post(
  "/users",
  [
    check("firstName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "firstName"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "lastName"'),
    check("emailAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "emailAddress"'),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
  ],
  async (req, res, next) => {
    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);

    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      errors.status = 400;
      errors.message = errorMessages;
      next(errors);
    } else {
      // Get the user from the request body.
      const user = req.body;

      // Hash the new user's password.
      user.password = bcryptjs.hashSync(user.password);

      try {
        await User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          password: user.password
        });

        // Creates a user, sets the Location header to "/", and returns no content
        res.status(201).location('/').end();

      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const errorMsg = error.errors.map(err => err.message);
          console.error("Validation errors: ", errorMsg);
          error.message = errorMsg;

          next(error);
        }
      }
      console.log(user);
    }
  }
);

// Export "/books" router
module.exports = router;
