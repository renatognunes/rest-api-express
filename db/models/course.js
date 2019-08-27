const Sequelize = require('sequelize');

/**
 * Module Course initialize the Courses table model
 * @namespace Course
 * @extends Sequelize.Model
 */
module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for "title"'
        },
        notNull: {
          msg: 'Please provide a value for "title"'
        }
      }
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for "lastName"'
        },
        notNull: {
          msg: 'Please provide a value for "lastName"'
        }
      }
    },
    estimatedTime: {
      type: Sequelize.STRING,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
    },
  },
  {
   sequelize 
  });

  Course.associate = (models) => {
    // Associations
    Course.belongsTo(models.User, { 
      foreignKey: 'userId',
    });
  };

  return Course;
};