module.exports = (sequelize, Sequelize) => {
    const UserHistory = sequelize.define('user_histories', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        player_one_id: {
          type: DataTypes.STRING,
          allowNull: false
        },
        player_two_id: {
          type: DataTypes.STRING
        },
        won_or_losed: {
          type: DataTypes.NUMBER
        },
        time: {
            type: Date
        },
        user_one_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        user_two_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
      });
      return UserHistory;
};