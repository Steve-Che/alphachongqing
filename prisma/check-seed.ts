import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [users, districts, streets, shops, inviteCodes, apartmentUnits] =
    await Promise.all([
      prisma.user.count(),
      prisma.district.count(),
      prisma.street.count(),
      prisma.shop.count(),
      prisma.inviteCode.count(),
      prisma.apartmentUnit.count(),
    ]);

  console.log(JSON.stringify({ users, districts, streets, shops, inviteCodes, apartmentUnits }, null, 2));
}

main()
  .catch((e) => {
    console.error("查询失败:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
