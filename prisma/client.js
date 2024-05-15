// import { PrismaClient } from "@prisma/client";

const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

module.exports = { prisma };
