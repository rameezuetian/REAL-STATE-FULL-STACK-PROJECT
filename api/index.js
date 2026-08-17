const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

import userRoute from "./routes/user.route"

dotenv.config({ path: path.resolve(__dirname, "config/config.env") });

const app = express();
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

if (!mongoUri) {
  console.error(
    "MongoDB URI is missing. Add MONGO_URI or MONGO_URL to api/config/config.env"
  );
  process.exit(1);
}

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




// api routes
app.use('/api/user' , userRoute )