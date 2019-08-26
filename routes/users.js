/**
 * Import database User model
 * @const User
 */
const db = require("../db");
const { User } = db.models;
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const authenticateUser = require("../authenticateUser");

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
router.get("/users", authenticateUser, (req, res) => {
  // Returns the currently authenticated user
  res.status(200).json({ currentUser: req.currentUser });
});

// Route for creating new user
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
      .withMessage('Please provide a value for "emailAddress"')
      .isEmail()
      .withMessage('Please provide a valid value for "emailAddress"')
      .custom( async value => {
        const user = await User.findOne({
          where: { emailAddress: value },
        });
        if (user) {
          throw new Error('E-mail already in use');
        } else {
          return true;
        }
      }),
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
      errors.error = "Bad Request";
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
    }
  }
);

// Export "/books" router
module.exports = router;
