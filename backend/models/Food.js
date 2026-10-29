const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    cuisine: { type: String, required: true, trim: true },
    ingredients: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    searchText: { type: String, default: "", select: false },
  },
  { timestamps: true }
);

const removeAccents = (str) =>
  String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

foodSchema.pre("save", function () {
  this.searchText = removeAccents(
    [this.foodId, this.name, this.category, this.cuisine].join(" ")
  );
});

foodSchema.statics.removeAccents = removeAccents;

module.exports = mongoose.model("Food", foodSchema, "foods");
