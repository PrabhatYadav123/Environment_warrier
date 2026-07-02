import "./config/env.js";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";

function arg(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const name = arg("name") || process.env.ADMIN_NAME || "Admin";
const email = arg("email") || process.env.ADMIN_EMAIL;
const password = arg("password") || process.env.ADMIN_PASSWORD;
const role = arg("role") || process.env.ADMIN_ROLE || "admin";

if (!email || !password) {
  console.error("Missing admin credentials. Provide --email and --password, or set ADMIN_EMAIL and ADMIN_PASSWORD for this command.");
  process.exit(1);
}

if (!["admin", "author"].includes(role)) {
  console.error("ADMIN_ROLE must be either admin or author.");
  process.exit(1);
}

await connectDb();

const existing = await User.findOne({ email });
if (existing) {
  console.error("A user with this email already exists.");
  process.exit(1);
}

await User.create({ name, email, password, role });
console.log(`${role} user created for ${email}`);
process.exit(0);
