import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, username: true, role: true, passwordHash: true },
  });
  console.log("用户列表:", users.map((u) => ({ email: u.email, username: u.username, role: u.role })));

  const admin = users.find((u) => u.email === "admin@alphachongqing.local");
  if (admin) {
    const ok = await bcrypt.compare("admin123", admin.passwordHash);
    console.log("admin123 密码校验:", ok ? "通过" : "失败");
  } else {
    console.log("admin@alphachongqing.local 不存在");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
