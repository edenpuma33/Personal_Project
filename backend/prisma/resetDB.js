require("dotenv").config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    // Explicitly list models to avoid non-model keys
    const models = ['user', 'cart', 'product']; // Order matters due to foreign keys

    for (const model of models) {
      console.log(`Resetting DB & Auto_increment: ${model}`);
      
      // Delete all records
      await prisma[model].deleteMany();
      
      // Reset auto-increment (MySQL-specific)
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${model}\` AUTO_INCREMENT = 1`);
    }

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();