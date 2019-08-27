const db = require("../db");
const { User } = db.models;
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const authenticateUser = require("../auth");

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


/**
 * Router for retrieving current user
 * @method GET
 * @function authenticateUser - Get the user credentials 
 * @param {express.resquest}
 * @param {express.response}
 * @returns {Promise} from authenticateUser function. If resolve it will respond with the current user information in JSON format.
 */
router.get("/users", authenticateUser, (req, res) => {
  res.status(200).json({ currentUser: req.currentUser });
});


/**
 * Router for creating a new user
 * @method POST
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will create a new user and store it in the database. If it throws, find validation errors and print messages.
 */
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
        if(value) {
          const user = await User.findOne({
            where: { emailAddress: value }
          });
          if (user) {
            throw new Error('E-mail already in use');
          } else {
            return true;
          }
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
      // Get a list of error messages.
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

        res.status(201).location('/').end();
      } catch (error) {
          next(error);
      }
    }
  }
);


module.exports = router;
