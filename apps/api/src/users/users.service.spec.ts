import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

function prismaMockFactory() {
    return {
        user: {
            findUnique: jest.fn(),
        },
    } as unknown as PrismaService;
}

describe('UsersService', () => {
    let users: UsersService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useFactory: prismaMockFactory },
            ],
        }).compile();

        users = module.get(UsersService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(users).toBeDefined();
    });

    describe('findByEmail', () => {
        it('cuando existe, lo devuelve', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'a@b.c' });

            const u = await users.findByEmail('a@b.c');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.c' } });
            expect(u).toEqual({ id: 1, email: 'a@b.c' });
        });

        it('cuando no existe, devuelve null', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const u = await users.findByEmail('x@y.z');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'x@y.z' } });
            expect(u).toBeNull();
        });
    });
});