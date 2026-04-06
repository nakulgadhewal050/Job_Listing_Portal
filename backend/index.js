import dotenv from "dotenv";
dotenv.config();
import express, { urlencoded } from "express";
const app = express();
const PORT = process.env.PORT || 8080;
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./Router/authRoute.js";
import profileRouter from "./Router/profileRoute.js";
import jobRouter from "./Router/jobRoute.js";
import applicationRouter from "./Router/applicationRoute.js";
import savedJobRouter from "./Router/savedJobRoute.js";
import cors from "cors";
import userRouter from "./Router/userRoute.js";

app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// CORS configuration for production
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.BASE_URL, 
        "http://localhost:5173"
      
      ].filter(Boolean);

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/saved-jobs", savedJobRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("server started");
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
