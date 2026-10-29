require("dotenv").config();
const mongoose = require("mongoose");
const Food = require("./models/Food");

const DB_NAME = "235951_TrinhHoangDinh";

const samples = [
  {
    foodId: "F001",
    name: "Phở bò",
    category: "Món nước",
    cuisine: "Miền Bắc",
    ingredients: ["bánh phở", "thịt bò", "hành lá", "gừng", "quế", "hồi"],
    price: 55000,
    quantity: 30,
    description: "Phở bò truyền thống với nước dùng hầm xương trong và thơm.",
    imageUrl: "",
  },
  {
    foodId: "F002",
    name: "Bún chả",
    category: "Món bún",
    cuisine: "Hà Nội",
    ingredients: ["bún", "thịt heo nướng", "nước mắm", "rau sống", "tỏi", "ớt"],
    price: 50000,
    quantity: 25,
    description: "Thịt heo nướng than hoa ăn kèm bún và nước chấm chua ngọt.",
    imageUrl: "",
  },
  {
    foodId: "F003",
    name: "Cơm tấm sườn",
    category: "Món cơm",
    cuisine: "Miền Nam",
    ingredients: ["cơm tấm", "sườn nướng", "trứng ốp la", "dưa leo", "nước mắm"],
    price: 45000,
    quantity: 40,
    description: "Cơm tấm với sườn nướng thơm, ăn kèm trứng và đồ chua.",
    imageUrl: "",
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: DB_NAME });
    await Food.deleteMany({});
    const result = await Food.insertMany(samples);
    console.log("Da them", result.length, "mon an vao database", DB_NAME);
  } catch (err) {
    console.error("Loi:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
