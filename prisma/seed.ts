import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashSync("admin123", 10),
    },
  });

  await prisma.flavor.deleteMany();

  const flavors = [
    {
      name: "Vanille",
      price: 1.5,
      ingredients: "Milch, Sahne, Zucker, Vanilleschoten, Eigelb",
      additives: "",
      allergens: "Milch, Ei",
      sortOrder: 1,
    },
    {
      name: "Schokolade",
      price: 1.5,
      ingredients: "Milch, Sahne, Zucker, Kakaopulver, Kakaobutter",
      additives: "Emulgator (Sojalecithin)",
      allergens: "Milch, Soja",
      sortOrder: 2,
    },
    {
      name: "Erdbeere",
      price: 1.7,
      ingredients: "Milch, Sahne, Zucker, Erdbeeren (20%)",
      additives: "Farbstoff (Karmin)",
      allergens: "Milch",
      sortOrder: 3,
    },
    {
      name: "Pistazie",
      price: 1.9,
      ingredients: "Milch, Sahne, Zucker, Pistazien (15%), Mandelöl",
      additives: "Farbstoff (Kupferchlorophyllin)",
      allergens: "Milch, Schalenfrüchte",
      sortOrder: 4,
    },
    {
      name: "Zitrone (Sorbet)",
      price: 1.5,
      ingredients: "Wasser, Zucker, Zitronensaft (25%), Zitronenschale",
      additives: "",
      allergens: "",
      sortOrder: 5,
    },
    {
      name: "Mango (Sorbet)",
      price: 1.7,
      ingredients: "Wasser, Zucker, Mangopüree (30%)",
      additives: "",
      allergens: "",
      sortOrder: 6,
    },
    {
      name: "Haselnuss",
      price: 1.7,
      ingredients: "Milch, Sahne, Zucker, Haselnüsse (18%), Haselnusspaste",
      additives: "",
      allergens: "Milch, Schalenfrüchte (Haselnuss)",
      sortOrder: 7,
    },
    {
      name: "Stracciatella",
      price: 1.7,
      ingredients: "Milch, Sahne, Zucker, Vanille, Schokoladensplitter",
      additives: "Emulgator (Sojalecithin)",
      allergens: "Milch, Soja",
      sortOrder: 8,
    },
  ];

  for (const flavor of flavors) {
    await prisma.flavor.create({ data: flavor });
  }

  console.log("Seed data created successfully!");
  console.log("Admin login: username=admin, password=admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
