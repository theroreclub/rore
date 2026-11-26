import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || "";
  const name = args[2] || process.env.ADMIN_NAME || "Rore Admin";

  if (!email || !email.includes("@")) {
    console.error("❌ Error: Please provide a valid email address.");
    console.log("Usage: npx tsx prisma/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters long.");
    console.log("Usage: npx tsx prisma/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  console.log(`🔐 Creating or promoting admin user: ${email}...`);

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: Role.ADMIN,
    },
    update: {
      passwordHash,
      role: Role.ADMIN,
      name,
    },
  });

  console.log(`✅ Success! Admin user is active.`);
  console.log(`   ID:    ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Admin creation error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
