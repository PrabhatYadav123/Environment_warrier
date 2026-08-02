import rateLimit from "express-rate-limit";

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
};

export const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 300
});

export const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." }
});

export const contactLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: "Too many messages sent. Please try again later." }
});

export const engagementLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 30
});
