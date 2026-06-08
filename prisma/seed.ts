import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding demo users...");

  const password = await bcrypt.hash("demo@1234", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@demo.com",
      password,
      role: "ADMIN",
    },
  });

  const pm = await db.user.upsert({
    where: { email: "pm@demo.com" },
    update: {},
    create: {
      name: "Project Manager",
      email: "pm@demo.com",
      password,
      role: "PROJECT_MANAGER",
    },
  });

  const member = await db.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: {
      name: "Team Member",
      email: "member@demo.com",
      password,
      role: "TEAM_MEMBER",
    },
  });

  console.log("Demo users created:");
  console.log(" Admin:", admin.email);
  console.log(" Project Manager:", pm.email);
  console.log(" Team Member:", member.email);
  console.log("Password for all: demo@1234");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
