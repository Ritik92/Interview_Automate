import bcrypt from "bcryptjs";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
export async function POST(req) {
  const { email, password, phone } = await req.json();

  // Validate input
  if (!email || !password || !phone) {
    return new Response("Email, Password, and Phone number are required.", { status: 400 });
  }

  if (phone.length < 10) {
    return new Response("Invalid phone number.", { status: 400 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user to your database (replace with your DB logic)
  // Example: Prisma
  await prisma.user.create({
    data: { email, password: hashedPassword, phone },
  });

  return new Response("User created successfully!", { status: 201 });
}
