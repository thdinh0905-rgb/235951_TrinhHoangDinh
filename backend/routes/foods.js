const express = require("express");
const mongoose = require("mongoose");
const Food = require("../models/Food");

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function findFood(id) {
  if (mongoose.isValidObjectId(id)) {
    return Food.findOne({ $or: [{ _id: id }, { foodId: id }] });
  }
  return Food.findOne({ foodId: id });
}

function validateBody(body, partial) {
  const errors = [];
  const data = {};
  const textFields = ["foodId", "name", "category", "cuisine"];

  for (const f of textFields) {
    if (body[f] === undefined) {
      if (!partial) errors.push(`${f} la bat buoc`);
      continue;
    }
    if (typeof body[f] !== "string" || !body[f].trim()) {
      errors.push(`${f} phai la chuoi khong rong`);
    } else {
      data[f] = body[f].trim();
    }
  }

  for (const f of ["price", "quantity"]) {
    if (body[f] === undefined) {
      if (!partial) errors.push(`${f} la bat buoc`);
      continue;
    }
    const n = Number(body[f]);
    if (body[f] === "" || Number.isNaN(n) || n < 0) {
      errors.push(`${f} phai la so >= 0`);
    } else {
      data[f] = n;
    }
  }

  if (body.ingredients !== undefined) {
    let arr = body.ingredients;
    if (typeof arr === "string") arr = arr.split(",");
    if (!Array.isArray(arr)) {
      errors.push("ingredients phai la mang hoac chuoi phan cach bang dau phay");
    } else {
      data.ingredients = arr.map((x) => String(x).trim()).filter(Boolean);
    }
  }

  for (const f of ["description", "imageUrl"]) {
    if (body[f] !== undefined) data[f] = String(body[f]);
  }

  return { errors, data };
}

// GET /api/foods  va  GET /api/foods?search=pho
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(Food.removeAccents(search.trim())), "i");
      filter = { searchText: rx };
    }
    const foods = await Food.find(filter).sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    next(err);
  }
});

// GET /api/foods/:id
router.get("/:id", async (req, res, next) => {
  try {
    const food = await findFood(req.params.id);
    if (!food) return res.status(404).json({ message: "Khong tim thay mon an" });
    res.json(food);
  } catch (err) {
    next(err);
  }
});

// POST /api/foods
router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = validateBody(req.body || {}, false);
    if (errors.length) {
      return res.status(400).json({ message: "Du lieu khong hop le", errors });
    }
    const exists = await Food.findOne({ foodId: data.foodId });
    if (exists) {
      return res.status(409).json({ message: `foodId ${data.foodId} da ton tai` });
    }
    const food = await Food.create(data);
    res.status(201).json(food);
  } catch (err) {
    next(err);
  }
});

// PUT /api/foods/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { errors, data } = validateBody(req.body || {}, true);
    if (errors.length) {
      return res.status(400).json({ message: "Du lieu khong hop le", errors });
    }
    const food = await findFood(req.params.id);
    if (!food) return res.status(404).json({ message: "Khong tim thay mon an" });

    if (data.foodId && data.foodId !== food.foodId) {
      const dup = await Food.findOne({ foodId: data.foodId });
      if (dup) {
        return res.status(409).json({ message: `foodId ${data.foodId} da ton tai` });
      }
    }
    Object.assign(food, data);
    await food.save();
    res.json(food);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/foods/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const food = await findFood(req.params.id);
    if (!food) return res.status(404).json({ message: "Khong tim thay mon an" });
    await food.deleteOne();
    res.json({ message: "Da xoa mon an", foodId: food.foodId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
