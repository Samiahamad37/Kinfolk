import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const resolvedUrl = url.startsWith("file:")
  ? `file:${path.resolve(process.cwd(), url.replace(/^file:/, ""))}`
  : url;

const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.historicalRecord.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.person.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Samia Demo",
      email: "demo@kinfolk.app",
      passwordHash: await bcrypt.hash("demo1234", 10),
    },
  });

  const people = await Promise.all(
    [
      {
        firstName: "Joseph",
        lastName: "Mwangi",
        gender: "Male",
        birthDate: "1928-03-12",
        deathDate: "2001-08-04",
        birthPlace: "Moshi, Tanzania",
        occupation: "Farmer",
        biography: "Patriarch of the Mwangi family line in Kilimanjaro region.",
      },
      {
        firstName: "Amina",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1932-11-02",
        deathDate: "2010-01-19",
        birthPlace: "Arusha, Tanzania",
        occupation: "Teacher",
        biography: "Known for keeping family oral histories and letters.",
      },
      {
        firstName: "Daniel",
        lastName: "Mwangi",
        gender: "Male",
        birthDate: "1955-06-21",
        birthPlace: "Dar es Salaam, Tanzania",
        occupation: "Civil engineer",
      },
      {
        firstName: "Grace",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1958-09-14",
        birthPlace: "Dar es Salaam, Tanzania",
        occupation: "Nurse",
      },
      {
        firstName: "Samia",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1990-04-08",
        birthPlace: "Dar es Salaam, Tanzania",
        occupation: "Software developer",
        biography: "Documents the family tree and digitizes historical records.",
      },
      {
        firstName: "Imani",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1993-12-01",
        birthPlace: "Nairobi, Kenya",
        occupation: "Designer",
      },
    ].map((person) =>
      prisma.person.create({
        data: { ...person, ownerId: user.id },
      }),
    ),
  );

  const [joseph, amina, daniel, grace, samia, imani] = people;

  await prisma.relationship.createMany({
    data: [
      { ownerId: user.id, fromPersonId: joseph.id, toPersonId: daniel.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: amina.id, toPersonId: daniel.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: joseph.id, toPersonId: grace.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: amina.id, toPersonId: grace.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: joseph.id, toPersonId: amina.id, type: "SPOUSE" },
      { ownerId: user.id, fromPersonId: daniel.id, toPersonId: samia.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: daniel.id, toPersonId: imani.id, type: "PARENT" },
    ],
  });

  await prisma.historicalRecord.createMany({
    data: [
      {
        ownerId: user.id,
        personId: joseph.id,
        title: "Birth registration",
        recordType: "Birth",
        eventDate: "1928-03-12",
        location: "Moshi, Tanzania",
        description: "Registered at the local district office.",
      },
      {
        ownerId: user.id,
        personId: joseph.id,
        title: "Marriage to Amina",
        recordType: "Marriage",
        eventDate: "1953-05-10",
        location: "Arusha, Tanzania",
      },
      {
        ownerId: user.id,
        personId: daniel.id,
        title: "Moved to Dar es Salaam",
        recordType: "Migration",
        eventDate: "1974-01-01",
        location: "Dar es Salaam, Tanzania",
        description: "Relocated for engineering studies and work.",
      },
      {
        ownerId: user.id,
        personId: samia.id,
        title: "University enrollment",
        recordType: "Other",
        eventDate: "2018-10-01",
        location: "Ardhi University",
        description: "Began studies in Information Systems Management.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Login: demo@kinfolk.app / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
