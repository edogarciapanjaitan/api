"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = ((_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient())
    .$extends({
    query: {
        user: {
            async create({ args, query }) {
                // Contoh: Logic sebelum create user
                return query(args);
            },
        },
    },
});
