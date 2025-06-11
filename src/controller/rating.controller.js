const rateModel = require("../model/rateModel");

const addRating = async (req, res) => {
  const { trainerID, rating } = req.body;
  const { userID } = req.user;
  console.log("Token ID", userID);

  try {
    const checkRating = await rateModel.findOne({
      userID: userID,
      trainerID: trainerID,
    });

    if (checkRating) {
      const updatedRating = await rateModel.findOneAndUpdate(
        {
          trainerID: trainerID,
          userID: userID,
        },
        {
          rating: rating,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Trainer has been rated",
        status: true,
        updatedRating,
      });
    }

    const giveRating = await rateModel.create({ ...req.body, userID });

    if (!giveRating) {
      return res.status(400).json({
        message: "There is an error while giving the rating to the trainer",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Trainer has been rated",
      status: true,
      giveRating,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = { addRating };
