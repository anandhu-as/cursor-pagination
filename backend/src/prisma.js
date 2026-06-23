import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance.
// In Node.js, this instance will be shared throughout the lifecycle of the app.
const prisma = new PrismaClient();

export default prisma;
