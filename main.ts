import { PrismaClient } from '@prisma/client';
import express from 'express';
import { enhance } from '@zenstackhq/runtime';
import {
    PostCreateSchema,
    SpaceCreateSchema,
    SpaceUserCreateSchema,
    UserCreateSchema,
} from '@zenstackhq/runtime/zod/models';
import { z } from 'zod';
require('express-async-errors');

main();

async function main() {
    const prisma = new PrismaClient();

    // express app and routes
    const app = express();

    app.use(express.json());

    // auth middleware
    app.use(async (req, res, next) => {
        const uid = req.headers['x-user-id'];
        if (typeof uid === 'string') {
            req.uid = parseInt(uid);
        }

        req.db = enhance(prisma, {
            user: req.uid ? { id: req.uid } : undefined,
        });

        if (!req.uid) {
            if (req.path !== '/user' || req.method !== 'POST') {
                res.status(401).send({ error: 'Unauthorized' });
                return;
            }
        }
        next();
    });

    // user routes
    app.post('/user', async (req, res) => {
        const data = UserCreateSchema.omit({ id: true }).parse(req.body);
        const r = await req.db.user.create({ data });
        res.send(r);
    });

    // space routes
    app.post('/space', async (req, res) => {
        const data = SpaceCreateSchema.omit({ id: true }).parse(req.body);
        const r = await req.db.space.create({
            data: { ...data, ownerId: req.uid! },
        });
        res.send(r);
    });

    // space member management

    app.post('/space/:slug/member', async (req, res) => {
        const data = SpaceUserCreateSchema.omit({ id: true })
            .merge(
                z.object({
                    userId: z.number(),
                })
            )
            .parse(req.body);
        const { userId, ...rest } = data;
        const r = await req.db.spaceUser.create({
            data: {
                ...rest,
                space: { connect: { slug: req.params.slug } },
                user: { connect: { id: userId } },
            },
        });
        res.send(r);
    });

    // post routes

    app.post('/space/:slug/post', async (req, res) => {
        const data = PostCreateSchema.omit({ id: true }).parse(req.body);
        const r = await req.db.post.create({
            data: {
                ...data,
                space: { connect: { slug: req.params.slug } },
                author: { connect: { id: req.uid! } },
            },
        });
        res.send(r);
    });

    app.get('/space/:slug/post', async (req, res) => {
        const posts = await req.db.post.findMany({
            include: { author: true },
            where: {
                space: { slug: req.params.slug },
            },
        });
        res.send(posts);
    });

    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}
