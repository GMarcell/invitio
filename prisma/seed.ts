import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { TEMPLATES } from "../lib/templates";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // ── Templates ────────────────────────────────────────────────
  for (const [i, tpl] of TEMPLATES.entries()) {
    await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        emoji: tpl.emoji,
        gradient: tpl.gradient,
        isPremium: tpl.isPremium,
        theme: tpl.theme as object,
        sortOrder: i,
      },
      create: {
        slug: tpl.slug,
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        emoji: tpl.emoji,
        gradient: tpl.gradient,
        isPremium: tpl.isPremium,
        theme: tpl.theme as object,
        sortOrder: i,
      },
    });
  }
  console.log(`Seeded ${TEMPLATES.length} templates`);

  // ── Demo user ────────────────────────────────────────────────
  const demoEmail = "demo@invitio.app";
  let demo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    demo = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo Host",
        password: await bcrypt.hash("demo1234", 10),
      },
    });
  }

  // ── Demo invitation ──────────────────────────────────────────
  const weddingTpl = await prisma.template.findUnique({ where: { slug: "classic-wedding" } });

  const demoInvite = await prisma.invitation.upsert({
    where: { slug: "raka-and-aisyah-wedding" },
    update: {
      enableReminders: true,
      reminderOffsetDays: 7,
    },
    create: {
      slug: "raka-and-aisyah-wedding",
      title: "Raka & Aisyah",
      subtitle: "The Wedding Celebration",
      description:
        "With hearts full of joy, together with our families, we invite you to celebrate the marriage of Raka and Aisyah. Your presence and prayers will mean the world to us.",
      category: "wedding",
      eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      timezone: "Asia/Jakarta",
      location: "The Ritz-Carlton Grand Ballroom, Jakarta",
      locationLink: "https://maps.google.com/?q=Ritz-Carlton+Jakarta",
      dressCode: "Formal / Semi-Formal",
      rsvpDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      hasMealOption: true,
      mealOptions: ["Beef Wellington", "Grilled Salmon", "Vegetarian Pasta"],
      customQuestions: [{ id: "q1", label: "Do you have any dietary restrictions?", required: false }],
      status: "active",
      defaultLanguage: "en",
      showCountdown: true,
      showCalendar: true,
      showGuestbook: true,
      showGift: true,
      enableReminders: true,
      reminderOffsetDays: 7,
      ownerId: demo.id,
      templateId: weddingTpl?.id,
      theme: {
        colors: { primary: "#b8860b", bg: "#fdfaf3" },
        fonts: {},
      } as object,
      giftAccounts: {
        create: [
          {
            label: "Raka (Groom)",
            accountHolder: "Raka Pratama",
            bankName: "BCA",
            accountNumber: "8830123456",
            sortOrder: 0,
          },
          {
            label: "Aisyah (Bride)",
            accountHolder: "Aisyah Salsabila",
            bankName: "Mandiri",
            accountNumber: "1370098765432",
            sortOrder: 1,
          },
        ],
      },
      guests: {
        create: [
          { name: "Budi Santoso", email: "budi@example.com", phone: "6281234567890", source: "import" },
          { name: "Sari Dewi", email: "sari@example.com", phone: "6281398765432", source: "import" },
          { name: "Andi Wijaya", email: "andi@example.com", phone: "6281577777777", source: "import" },
        ],
      },
    },
  });

  const existingRsvps = await prisma.rsvp.count({ where: { invitationId: demoInvite.id } });
  if (existingRsvps === 0) {
    await prisma.rsvp.createMany({
      data: [
        {
          invitationId: demoInvite.id,
          name: "Budi Santoso",
          email: "budi@example.com",
          phone: "6281234567890",
          status: "yes",
          guestCount: 2,
          mealChoice: "Beef Wellington",
          note: "Congratulations! Can't wait to celebrate.",
        },
        {
          invitationId: demoInvite.id,
          name: "Sari Dewi",
          email: "sari@example.com",
          phone: "6281398765432",
          status: "maybe",
          guestCount: 1,
          note: "Will try my best to make it!",
        },
      ],
    });

    await prisma.guestbookMessage.createMany({
      data: [
        {
          invitationId: demoInvite.id,
          name: "Sari Dewi",
          message: "Congratulations Raka & Aisyah! Wishing you a lifetime of love and happiness. 🥂",
        },
        {
          invitationId: demoInvite.id,
          name: "Budi Santoso",
          message: "So happy for you both! See you at the wedding!",
        },
      ],
    });

    await prisma.gift.create({
      data: {
        invitationId: demoInvite.id,
        giverName: "Budi Santoso",
        type: "cash",
        amount: 1000000,
        currency: "IDR",
        notes: "Transfer from BCA",
      },
    });
  }

  console.log("Seeded demo user + invitation:");
  console.log("  Email:    demo@invitio.app");
  console.log("  Password: demo1234");
  console.log(`  Invite:   http://localhost:3000/i/${demoInvite.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
