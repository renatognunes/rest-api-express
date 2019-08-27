const db = require("../db");
const { User, Course } = db.models;
const { check, validationResult } = require("express-validator");
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
 * Router for retrieving all courses from the database
 * @method GET
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will respond with all courses in JSON format. If it throws, pass the error to the global error middleware.
 */
router.get("/courses", async (req, res, next) => {
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
    const error = new Error("Ops! Sorry, There is a problem in the server!");
    next(error);
  }
});


/**
 * Router for retrieving a single course from the database
 * @method GET
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will respond with the course corresponded to the route parameter value in JSON format. If it throws, pass the error to the global error middleware.
 */
router.get("/courses/:id", async (req, res, next) => {
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
    const error = new Error("Ops! Sorry, There is a problem in the server!");
    next(error);
  }
});


/**
 * Router for creating a new Course
 * @method POST
 * @function authenticateUser - Get the user credentials 
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will create a new course and store it in the database. If it throws, find validation errors and print messages.
 */
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
      // Get a list of error messages.
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
        res.status(201).location(`/api/courses/${course.id}`).end();
      } catch (error) {
        next(error);
      }
    }
  }
);


/**
 * Router for updating a course
 * @method PUT
 * @function authenticateUser - Get the user credentials 
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will update the course corresponded to the route parameter value. If it throws, find validation errors and print messages.
 */
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
        // Check if currentUser owns the course
        if (course.userId === req.currentUser.id) {
          try {
            await course.update({
              title: req.body.title,
              description: req.body.description,
              estimatedTime: req.body.estimatedTime,
              materialsNeeded: req.body.materialsNeeded,
              userId: req.currentUser.id
            });
            res.status(204).end();
          } catch (error) {
            next(error);
          }
        } else {
          res.status(403).end();
        }
      } else {
        const error = new Error("Ops! Sorry, There is a problem in the server!");
        next(error);
      }
    }
  }
);


/**
 * Router for deleting a course
 * @method DELETE
 * @function authenticateUser - Get the user credentials 
 * @param {express.resquest}
 * @param {express.response}
 * @param {express.next}
 * @returns {Promise} If resolve it will delete the course corresponded to the route parameter value. If it throws, pass the error to the global error middleware.
 */
router.delete("/courses/:id", authenticateUser, async (req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    // Check if currentUser owns the course
    if (course.userId === req.currentUser.id) {
      try {
        await course.destroy();
        res.status(204).end();
      } catch (error) {
        next(error);
      }
    } else {
      res.status(403).end();
    }
  } else {
    const error = new Error("Ops! Sorry, There is a problem in the server!");
    next(error);
  }
});


module.exports = router;