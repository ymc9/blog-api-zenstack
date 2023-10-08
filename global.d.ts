export {};

import { PrismaClient } from '@prisma/client';

declare global {
    namespace Express {
        export interface Request {
            uid?: number;
            db: PrismaClient;
        }
    }
}
