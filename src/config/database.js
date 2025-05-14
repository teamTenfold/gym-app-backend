const mongoose = require("mongoose");

main()
  .then((data) => {
    console.log("Database is successfuly connected");
  })
  .catch((error) => {
    console.log("There is am error connecting Database ", error);
  });

async function main() {
  // await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connect(
    "mongodb+srv://team:6LUGGmVwVIT4wxdN@cluster0.fmkhzh4.mongodb.net/"
  );
}
