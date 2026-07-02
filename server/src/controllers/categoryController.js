import asyncHandler from "express-async-handler";
import slugify from "slugify";
import Category from "../models/Category.js";

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort("name");
  res.json(categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    description: req.body.description,
    slug: slugify(req.body.name, { lower: true, strict: true })
  });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.name = req.body.name ?? category.name;
  category.description = req.body.description ?? category.description;
  if (req.body.name) {
    category.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  await category.save();
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
});
