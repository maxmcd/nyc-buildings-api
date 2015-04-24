'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('dob_violations', { 
      id                    : {
                                type:Sequelize.INTEGER,
                                primaryKey: true,
                                autoIncrement: true
                              },
      updatedAt             : Sequelize.DATE,
      createdAt             : Sequelize.DATE,

      bin                   : Sequelize.STRING,
      violation_number      : Sequelize.STRING,
      violation_category    : Sequelize.STRING,
      issue_date            : Sequelize.STRING,
      violation_type        : Sequelize.STRING,
      violation_number      : Sequelize.STRING,
      device_number         : Sequelize.STRING,
      ecb_number            : Sequelize.STRING,
      infraction_codes      : Sequelize.STRING,
      description           : Sequelize.STRING,
      disposition_code      : Sequelize.STRING,
      disposition_date      : Sequelize.STRING,
      disposition_inspector : Sequelize.STRING,
      comments              : Sequelize.STRING,



    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('dob_violations');

  }
};