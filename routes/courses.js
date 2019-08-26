const db = require("../db");
const { User, Course } = db.models;
const { check, validationResult } = require("express-validator");
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

// Router for all Courses
router.get("/courses", authenticateUser, async (req, res, next) => {
  const courses = await Course.findAll({
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  });
  if (courses) {
    res.status(200).json({ courses });
  } else {
    const err = new Error("Internal Server Error");
    err.message = "Ops! Sorry, There is a problem in the server!";
    err.error = "Internal Server Error";
    next(err);
  }
});

// Router for specific course
router.get("/courses/:id", authenticateUser, async (req, res, next) => {
  const course = await Course.findOne({
    where: { id: req.params.id },
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "emailAddress"]
      }
    ]
  });
  if (course) {
    res.status(200).json({ course });
  } else {
    const err = new Error("Internal Server Error");
    err.message = "Ops! Sorry, There is a problem in the server!";
    err.error = "Internal Server Error";
    next(err);
  }
});

// Router for creating new Course
router.post(
  "/courses",
  authenticateUser,
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
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
      try {
        const course = await Course.create({
          title: req.body.title,
          description: req.body.description,
          estimatedTime: req.body.estimatedTime,
          materialsNeeded: req.body.materialsNeeded,
          userId: req.currentUser.id
        });

        // Creates a course, sets the Location header to the URI for the course, and returns no content
        res
          .status(201)
          .location(`/api/courses/${course.id}`)
          .end();
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

// Router for update a course
router.put(
  "/courses/:id",
  authenticateUser,
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
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
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (course.userId === req.currentUser.id) {
          try {
            await course.update({
              title: req.body.title,
              description: req.body.description,
              estimatedTime: req.body.estimatedTime,
              materialsNeeded: req.body.materialsNeeded,
              userId: req.currentUser.id
            });
            // Updates a course and returns no content
            res.status(204).end();
          } catch (error) {
            if (error.name === "SequelizeValidationError") {
              const errorMsg = error.errors.map(err => err.message);
              console.error("Validation errors: ", errorMsg);
              error.message = errorMsg;

              next(error);
            }
          }
        } else {
          res.status(403).end();
        }
      } else {
        const err = new Error("Internal Server Error");
        err.message = "Ops! Sorry, There is a problem in the server!";
        err.error = "Internal Server Error";
        next(err);
      }
    }
  }
);

// Router for delete a course
router.delete("/courses/:id", authenticateUser, async (req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    if (course.userId === req.currentUser.id) {
      try {
        await course.destroy();
        // Deletes a course and returns no content
        res.status(204).end();
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          const errorMsg = error.errors.map(err => err.message);
          console.error("Validation errors: ", errorMsg);
          error.message = errorMsg;

          next(error);
        }
      }
    } else {
      res.status(403).end();
    }
  } else {
    const err = new Error("Internal Server Error");
    err.message = "Ops! Sorry, There is a problem in the server!";
    err.error = "Internal Server Error";
    next(err);
  }
});

// Export "/courses" router
module.exports = router;
