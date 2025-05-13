const mongoose = require("mongoose");

main()
  .then((data) => {
    console.log("Database is successfuly connected");
  })
  .catch((error) => {
    console.log("There is am error connecting Database ", error);
  });

async function main() {
  await mongoose.connect(process.env.LOCAT_HOST_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
