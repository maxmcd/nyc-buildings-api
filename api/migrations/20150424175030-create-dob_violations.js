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

      bin                   : Sequelize.DATE,
      violation_number      : Sequelize.DATE,
      violation_category    : Sequelize.DATE,
      issue_date            : Sequelize.DATE,
      violation_type        : Sequelize.DATE,
      violation_number      : Sequelize.DATE,
      device_number         : Sequelize.DATE,
      ecb_number            : Sequelize.DATE,
      infraction_codes      : Sequelize.DATE,
      description           : Sequelize.DATE,
      disposition_code      : Sequelize.DATE,
      disposition_date      : Sequelize.DATE,
      disposition_inspector : Sequelize.DATE,
      comments              : Sequelize.DATE,



    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('dob_violations');

  }
};