module.exports = (sequelize, Sequelize) => {
    const UserHistory = sequelize.define('user_histories', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        username_1: {
          type: Sequelize.STRING,
          allowNull: false
        },
        username_2: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username_won: {
            type: Sequelize.STRING,
            allowNull: false
        }
      });
      return UserHistory;
};