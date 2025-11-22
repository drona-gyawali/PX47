import { PrismaClient } from '../generated/prisma/index.js';
import { NODE_ENV } from './conf.js';

let prisma;

if (!prisma) {
  prisma = new PrismaClient();
}

if (NODE_ENV !== 'production') global.prisma = global.prisma || prisma;

export default prisma;
