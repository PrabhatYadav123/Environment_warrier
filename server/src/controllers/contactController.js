import asyncHandler from "express-async-handler";

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }

  console.log("Contact message", { name, email, message });
  res.status(201).json({ message: "Thanks for reaching out. We will reply soon." });
});
