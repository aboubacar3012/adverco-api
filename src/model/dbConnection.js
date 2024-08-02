const mongoose = require("mongoose");
const config = require("../utils/config");
mongoose
  // @ts-ignore
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log(process.env.NODE_ENV);
    console.log("✅ adverco Database connected successfully ✨✨");
  })
  .catch((error) => {
    console.log(config.MONGODB_URI);
    console.log("adverco Database is not connected❌", error);
  });
