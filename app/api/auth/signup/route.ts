import bcrypt from "bcryptjs";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
export async function POST(req) {
  const { email, password, name } = await req.json();

  // Validate input
  if (!email || !password || !name) {
    return new Response("Email, Password, and Name are required.", { status: 400 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the user to your database
  await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  return new Response("User created successfully!", { status: 201 });
}
