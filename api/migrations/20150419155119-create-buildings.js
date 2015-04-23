'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('buildings', { 
      id                         : {
                                    type:Sequelize.INTEGER,
                                    primaryKey: true,
                                    autoIncrement: true
                                   },
      updatedAt                  : Sequelize.DATE,
      createdAt                  : Sequelize.DATE,
      bbl                        : Sequelize.STRING,
      bin                        : Sequelize.STRING,
      health_area                : Sequelize.STRING,
      census_tract               : Sequelize.STRING,
      community_board            : Sequelize.STRING,
      buildings_on_lot           : Sequelize.STRING,
      tax_block                  : Sequelize.STRING,
      tax_lot                    : Sequelize.STRING,
      condo                      : Sequelize.STRING,
      vacant                     : Sequelize.STRING,
      cross_streets              : Sequelize.STRING,
      dob_special_place_name     : Sequelize.STRING,
      landmark_status            : Sequelize.STRING,
      local_law                  : Sequelize.STRING,
      environmental_restrictions : Sequelize.STRING,
      legal_adult_use            : Sequelize.STRING,
      loft_law                   : Sequelize.STRING,
      special_status             : Sequelize.STRING,
      city_owned                 : Sequelize.STRING,
      special_district           : Sequelize.STRING,
      complaints_total           : Sequelize.STRING,
      complaints_open            : Sequelize.STRING,
      violations_dob_total       : Sequelize.STRING,
      violations_dob_open        : Sequelize.STRING,
      violations_ecb_total       : Sequelize.STRING,
      violations_ecb_open        : Sequelize.STRING,
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('buildings');

  }
};