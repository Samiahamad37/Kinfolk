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
  await prisma.message.deleteMany();
  await prisma.documentPerson.deleteMany();
  await prisma.familyDocument.deleteMany();
  await prisma.storyPerson.deleteMany();
  await prisma.story.deleteMany();
  await prisma.photoPerson.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.album.deleteMany();
  await prisma.eventPerson.deleteMany();
  await prisma.familyEvent.deleteMany();
  await prisma.historicalRecord.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.person.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Samia Demo",
      email: "demo@kinfolk.app",
      passwordHash: await bcrypt.hash("demo1234", 10),
      settings: { create: {} },
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
        deathPlace: "Dar es Salaam, Tanzania",
        occupation: "Farmer",
        education: "Local mission school",
        biography: "Patriarch of the Mwangi family line in Kilimanjaro region.",
        privacy: "public",
      },
      {
        firstName: "Amina",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1932-11-02",
        deathDate: "2010-01-19",
        birthPlace: "Arusha, Tanzania",
        deathPlace: "Dar es Salaam, Tanzania",
        occupation: "Teacher",
        education: "Teachers' college, Arusha",
        biography: "Known for keeping family oral histories and letters.",
        privacy: "public",
      },
      {
        firstName: "Daniel",
        lastName: "Mwangi",
        gender: "Male",
        birthDate: "1955-06-21",
        birthPlace: "Dar es Salaam, Tanzania",
        occupation: "Civil engineer",
        education: "B.Sc. Engineering, UDSM",
        email: "daniel.mwangi@email.com",
        phone: "+255 700 000 001",
        biography: "Moved to Dar for studies and built a career in infrastructure.",
        privacy: "family",
      },
      {
        firstName: "Grace",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1958-09-14",
        birthPlace: "Dar es Salaam, Tanzania",
        occupation: "Nurse",
        education: "Nursing diploma, Muhimbili",
        email: "grace.mwangi@email.com",
        biography: "Cared for both patients and the family's written memory.",
        privacy: "family",
      },
      {
        firstName: "Samia",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1990-04-08",
        birthPlace: "Dar es Salaam, Tanzania",
        occupation: "Software developer",
        education: "B.Sc. Information Systems, Ardhi University",
        email: "demo@kinfolk.app",
        phone: "+255 700 000 090",
        biography: "Documents the family tree and digitizes historical records.",
        privacy: "family",
      },
      {
        firstName: "Imani",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "1993-12-01",
        birthPlace: "Nairobi, Kenya",
        occupation: "Designer",
        education: "B.A. Design, University of Nairobi",
        email: "imani.mwangi@email.com",
        biography: "Designs the visual language of the family's digital archive.",
        privacy: "family",
      },
      {
        firstName: "Kofi",
        lastName: "Owusu",
        gender: "Male",
        birthDate: "1956-02-18",
        birthPlace: "Accra, Ghana",
        occupation: "Accountant",
        privacy: "family",
      },
      {
        firstName: "Asha",
        lastName: "Mwangi",
        gender: "Female",
        birthDate: "2018-07-22",
        birthPlace: "Dar es Salaam, Tanzania",
        privacy: "close-family",
      },
    ].map((person) =>
      prisma.person.create({
        data: { ...person, ownerId: user.id },
      }),
    ),
  );

  const [joseph, amina, daniel, grace, samia, imani, kofi, asha] = people;

  await prisma.relationship.createMany({
    data: [
      { ownerId: user.id, fromPersonId: joseph.id, toPersonId: daniel.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: amina.id, toPersonId: daniel.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: joseph.id, toPersonId: grace.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: amina.id, toPersonId: grace.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: joseph.id, toPersonId: amina.id, type: "SPOUSE" },
      { ownerId: user.id, fromPersonId: daniel.id, toPersonId: samia.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: daniel.id, toPersonId: imani.id, type: "PARENT" },
      { ownerId: user.id, fromPersonId: grace.id, toPersonId: kofi.id, type: "SPOUSE" },
      { ownerId: user.id, fromPersonId: samia.id, toPersonId: asha.id, type: "PARENT" },
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

  const wedding = await prisma.familyEvent.create({
    data: {
      ownerId: user.id,
      type: "marriage",
      title: "Joseph & Amina wedding",
      date: "1953-05-10",
      year: 1953,
      month: 5,
      day: 10,
      location: "Arusha, Tanzania",
      description: "A garden ceremony with both Kilimanjaro and Arusha families.",
      people: { create: [{ personId: joseph.id }, { personId: amina.id }] },
    },
  });

  await prisma.familyEvent.create({
    data: {
      ownerId: user.id,
      type: "graduation",
      title: "Samia's university graduation",
      date: "2022-11-18",
      year: 2022,
      month: 11,
      day: 18,
      location: "Ardhi University",
      people: { create: [{ personId: samia.id }, { personId: daniel.id }] },
    },
  });

  await prisma.familyEvent.create({
    data: {
      ownerId: user.id,
      type: "reunion",
      title: "Mwangi family reunion",
      date: "2019-12-28",
      year: 2019,
      month: 12,
      day: 28,
      location: "Dar es Salaam",
      description: "Three generations gathered for stories and photographs.",
      people: {
        create: [daniel, grace, samia, imani].map((p) => ({ personId: p.id })),
      },
    },
  });

  void wedding;

  const albums = await Promise.all([
    prisma.album.create({
      data: {
        ownerId: user.id,
        title: "Kilimanjaro Roots",
        year: "1950–1970",
        description: "Early family life around Moshi and Arusha.",
        coverUrl: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800",
      },
    }),
    prisma.album.create({
      data: {
        ownerId: user.id,
        title: "Dar Days",
        year: "1990–2020",
        description: "City life, graduations, and reunions.",
        coverUrl: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
      },
    }),
  ]);

  await prisma.photo.create({
    data: {
      ownerId: user.id,
      albumId: albums[0].id,
      title: "Sunrise over Kilimanjaro",
      url: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=900",
      year: 1962,
      location: "Moshi",
      description: "A view Joseph loved to share with his children.",
      people: { create: [{ personId: joseph.id }, { personId: amina.id }] },
    },
  });
  await prisma.photo.create({
    data: {
      ownerId: user.id,
      albumId: albums[1].id,
      title: "Family reunion lunch",
      url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900",
      year: 2019,
      location: "Dar es Salaam",
      people: {
        create: [samia, imani, daniel].map((p) => ({ personId: p.id })),
      },
    },
  });
  await prisma.photo.create({
    data: {
      ownerId: user.id,
      albumId: albums[1].id,
      title: "Graduation day",
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900",
      year: 2022,
      location: "Ardhi University",
      people: { create: [{ personId: samia.id }] },
    },
  });

  await prisma.story.create({
    data: {
      ownerId: user.id,
      authorId: samia.id,
      title: "The letters Amina kept",
      excerpt: "How a trunk of letters became the seed of our digital archive.",
      content:
        "When we opened Amina's trunk after her passing, we found decades of letters tied with ribbon.\n\nEach envelope held a fragment of migration, marriage, and school news. Transcribing them taught us more about Joseph's quiet humor than any photograph could.\n\nThis archive exists because she believed memory was a gift you write down.",
      date: "2024-03-01",
      tags: JSON.stringify(["letters", "amina", "archive"]),
      readTime: 4,
      people: { create: [{ personId: amina.id }, { personId: joseph.id }, { personId: samia.id }] },
    },
  });

  await prisma.story.create({
    data: {
      ownerId: user.id,
      authorId: imani.id,
      title: "Designing our family crest",
      excerpt: "A modern mark for an old Kilimanjaro lineage.",
      content:
        "Imani sketched dozens of marks before landing on the baobab and path motif.\n\nThe crest now appears on reunion invitations and on the Roots & Relations sidebar.",
      date: "2023-08-12",
      tags: JSON.stringify(["design", "crest"]),
      readTime: 2,
      people: { create: [{ personId: imani.id }] },
    },
  });

  await prisma.familyDocument.create({
    data: {
      ownerId: user.id,
      title: "Joseph Mwangi birth registration",
      type: "birth-cert",
      year: 1928,
      fileSize: "1.2 MB",
      url: "#",
      description: "District office copy scanned in 2018.",
      people: { create: [{ personId: joseph.id }] },
    },
  });
  await prisma.familyDocument.create({
    data: {
      ownerId: user.id,
      title: "Joseph & Amina marriage certificate",
      type: "marriage-cert",
      year: 1953,
      fileSize: "890 KB",
      description: "Arusha civil registry extract.",
      people: { create: [{ personId: joseph.id }, { personId: amina.id }] },
    },
  });
  await prisma.familyDocument.create({
    data: {
      ownerId: user.id,
      title: "Daniel migration paperwork",
      type: "immigration",
      year: 1974,
      fileSize: "2.1 MB",
      description: "Student relocation documents to Dar es Salaam.",
      people: { create: [{ personId: daniel.id }] },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        ownerId: user.id,
        senderName: "Grace Mwangi",
        body: "I found another box of photos from the 1974 move — I'll upload them this weekend.",
      },
      {
        ownerId: user.id,
        senderName: "Imani Mwangi",
        body: "Can we tag Asha in the reunion album once her portrait is ready?",
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
