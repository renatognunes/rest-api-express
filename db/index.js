const Sequelize = require('sequelize');

/**
 * Create new Sequelize instance
 * @const sequelize
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db', 
  define: {
    timestamps: true,
  },
  logging: false,
});

/**
 * Include Book module to the database
 * @const db
 */
const db = {
  sequelize,
  Sequelize,
  models: {},
};

console.log('Testing the connection to the database...');
(async () => {
  try {
    // Test the connection to the database
    console.log('Connection to the database successful!');
    await sequelize.authenticate();

  } catch(error) {
    console.log(error);
  }
})();

// db.models.Book = require('./models/book.js')(sequelize);

// Exports db module
module.exports = db;