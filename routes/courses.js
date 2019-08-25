/**
 * Import database User model
 * @const User
 */
const db = require("../db");
const { User, Course } = db.models;
const { check, validationResult } = require("express-validator");

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

// Router for all Courses
router.get("/courses", async (req, res, next) => {
  await Course.findAll({
    include: [
      {
        model: User
      }
    ]
  })
    .then(courses => {
      // Returns a list of courses (including the user that owns each course)
      res.status(200).json({ courses });
    })
    .catch(next);
});

// Router for creating new Course
router.post(
  "/courses",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
  ],
  (req, res, next) => {
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
      // Get the course from the request body.
      const course = req.body;
      console.log(course);

      // Creates a course, sets the Location header to the URI for the course, and returns no content
      res.status(201).json({ return: "No Content" });
    }
  }
);

// Router for specific course
router.get("/courses/:id", async (req, res, next) => {
  await Course.findAll({
    where: { id: req.params.id },
    include: [
      {
        model: User
      }
    ]
  })
    .then(course => {
      console.log(course);
      // Returns a course (including the user that owns the course) for the provided course ID
      res.status(200).json({ course });
    })
    .catch(next);
});

// Router for update a course
router.put(
  "/courses/:id",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
  ],
  (req, res, next) => {
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
      // Get the course from the request body.
      const course = req.body;
      console.log(course);

      // Updates a course and returns no content
      res.status(204).json({ return: "No Content" });
    }
  }
);

// Router for delete a course
router.delete("/courses/:id", (req, res, next) => {
  // Deletes a course and returns no content
  res.status(204).json({ return: "No Content" });
});

// Export "/courses" router
module.exports = router;
