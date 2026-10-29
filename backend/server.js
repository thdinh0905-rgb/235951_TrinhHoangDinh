require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const foodRoutes = require("./routes/foods");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME || "235951_TrinhHoangDinh";

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "db_disconnected",
    database: dbConnected ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

app.use("/api/foods", foodRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Khong tim thay duong dan" });
});

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Du lieu khong hop le", error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Ma khong hop le" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "foodId da ton tai" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON khong hop le" });
  }
  console.error(err);
  res.status(500).json({ message: "Loi may chu hoac loi ket noi co so du lieu" });
});

mongoose
  .connect(process.env.MONGO_URI, { dbName: DB_NAME })
  .then(() => {
    console.log("Da ket noi MongoDB Atlas, database:", DB_NAME);
    app.listen(PORT, () => console.log("Backend chay o cong", PORT));
  })
  .catch((err) => {
    console.error("Khong ket noi duoc MongoDB:", err.message);
    process.exit(1);
  });
