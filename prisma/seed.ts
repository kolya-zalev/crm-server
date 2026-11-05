import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { getPrismaClientOptions } from "../apps/crm-server/src/prisma/prisma-client-options";
const prisma = new PrismaClient(getPrismaClientOptions());

async function main() {
  console.log("🌱 Cleaning database...");
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.note.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();

  console.log("🚀 Importing 5 leads with full relations into PostgreSQL...");

  // 1. LEAD: Kolya
  const kolya = await prisma.lead.create({
    data: {
      name: "Kolya",
      email: "kolaov356@gmail.com",
      phone: "+380986359129",
      company: "Home",
      status: "new",
      tags: [],
      notes: "yes",
      source: "no",
    },
  });

  // 2. LEAD: John
  const john = await prisma.lead.create({
    data: {
      name: "John",
      email: "johnexample@gmail.com",
      phone: "",
      company: "mcdonalds",
      status: "contacted",
      tags: [],
      notes: "test",
    },
  });

  // 3. LEAD: Alex
  const alex = await prisma.lead.create({
    data: {
      name: "Alex",
      email: "Alexexample@gmail.com",
      phone: "+44444444",
      company: "Apple",
      status: "qualified",
      tags: [],
      notes: "yes",
      source: "no",
    },
  });

  // 4. LEAD: Mark
  const mark = await prisma.lead.create({
    data: {
      name: "Mark",
      email: "markexample@gmail.com",
      phone: "+1241241124",
      company: "adidas",
      status: "won",
      tags: [],
      notes: "test",
    },
  });

  // 5. LEAD: Adam
  const adam = await prisma.lead.create({
    data: {
      name: "Adam",
      email: "adamexample@gmail.com",
      phone: "+8777777777",
      company: "Sony",
      status: "lost",
      tags: ["1"],
      notes: "yes",
      source: "no",
    },
  });

  // --- SEEDING NOTES ---
  console.log("📝 Seeding notes...");
  await prisma.note.createMany({
    data: [
      {
        leadId: kolya.id,
        text: "Initial contact via LinkedIn",
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        leadId: john.id,
        text: "Sent proposal email",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        leadId: alex.id,
        text: "Replied, interested",
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  });

  // --- SEEDING ACTIVITIES ---
  console.log("⚡ Seeding activities...");
  await prisma.activity.createMany({
    data: [
      {
        leadId: kolya.id,
        type: "lead_created",
        description: "Lead was created",
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        leadId: john.id,
        type: "status_changed",
        description: "new → contacted",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        leadId: alex.id,
        type: "note_added",
        description: "Note added",
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  });

  // --- SEEDING TASKS ---
  console.log("📋 Seeding tasks...");
  await prisma.task.create({
    data: {
      leadId: kolya.id,
      title: "Initial Discovery Call",
      description: "Discuss project scope",
      status: "completed",
      priority: "high",
      dueDate: new Date(Date.now() - 86400000 * 5),
      createdAt: new Date(Date.now() - 86400000 * 6),
      completedAt: new Date(Date.now() - 86400000 * 5),
    },
  });

  await prisma.task.create({
    data: {
      leadId: kolya.id,
      title: "Send Commercial Proposal",
      description: "",
      status: "pending",
      priority: "high",
      dueDate: new Date(Date.now() - 86400000 * 2),
      createdAt: new Date(Date.now() - 86400000 * 4),
    },
  });

  await prisma.task.create({
    data: {
      leadId: john.id,
      title: "Follow up on Contract",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: new Date(Date.now() + 86400000 * 3),
      createdAt: new Date(Date.now() - 86400000),
    },
  });

  await prisma.task.create({
    data: {
      leadId: alex.id,
      title: "Approve API Integration",
      description: "",
      status: "pending",
      priority: "high",
      dueDate: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  await prisma.task.create({
    data: {
      leadId: mark.id,
      title: "Add to Newsletter",
      description: "",
      status: "completed",
      priority: "low",
      dueDate: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 86400000 * 2),
      completedAt: new Date(Date.now() - 86400000),
    },
  });

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
    },
  });
  await prisma.user.create({
    data: {
      name: "Manager",
      email: "manager@example.com",
      passwordHash,
      role: "manager",
    },
  });
  await prisma.user.create({
    data: {
      name: "Member",
      email: "member@example.com",
      passwordHash,
      role: "member",
    },
  });

  // --- SEEDING TEAM MEMBERS ---
  console.log("Seeding team members...");
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Test Admin",
        email: "testadmin@example.com",
        role: "admin",
        status: "active",
        invitedAt: new Date(Date.now() - 86400000),
        joinedAt: new Date(Date.now() - 86400000),
      },
      {
        name: "Test Manager",
        email: "testmanager@example.com",
        role: "manager",
        status: "active",
        invitedAt: new Date(Date.now() - 86400000),
        joinedAt: new Date(Date.now() - 86400000),
      },
      {
        name: "Test Member",
        email: "testmember@example.com",
        role: "member",
        status: "active",
        invitedAt: new Date(Date.now() - 86400000),
        joinedAt: new Date(Date.now() - 86400000),
      },
    ],
  });
}

main()
  .then(() => {
    console.log(
      "✅ Success! Full relation dataset migrated to PostgreSQL (Seeded!).",
    );
  })
  .catch((err) => {
    console.error("❌ Seeding error encountered:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
