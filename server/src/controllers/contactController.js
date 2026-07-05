import asyncHandler from "express-async-handler";
import Contact from "../models/Contact.js";

// POST /api/contact — Public
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }

  const contact = await Contact.create({ name, email, subject, message })
  res.status(201).json({ message: "Thanks for reaching out. We will reply soon.", contact })
})

// GET /api/contact — Admin only
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 })
  res.json(contacts)
})

// PUT /api/contact/:id/read — Admin only
export const markAsRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  )
  if (!contact) {
    res.status(404)
    throw new Error("Contact not found")
  }
  res.json(contact)
})

// DELETE /api/contact/:id — Admin only
export const deleteContact = asyncHandler(async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id)
  res.json({ message: "Contact deleted" })
})