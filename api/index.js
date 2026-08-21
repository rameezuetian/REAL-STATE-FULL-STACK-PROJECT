import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import listingRoute from "./routes/listing.route.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


app.use(express.json());
app.use(cookieParser())
// api routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/listing" , listingRoute);

// error handling middleware (must be last)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});