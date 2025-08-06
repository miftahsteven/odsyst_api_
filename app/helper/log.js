const { prisma } = require("../../prisma/client");

const saveLog = async ({ user_id, activity, route }) => {

    const savingProcess = await prisma.log.create({
        data: {
            user_id: Number(user_id),
            activity: activity,
            route : route
        },
      });

      return savingProcess ? true : false;
};

module.exports = { saveLog }