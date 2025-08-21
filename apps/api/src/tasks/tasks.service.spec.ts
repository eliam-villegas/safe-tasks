import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

function prismaMockFactory() {
    return {
        task: {
            findMany: jest.fn(),
            count: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
            findUnique: jest.fn(),
        },
        $transaction: jest.fn((args) => Promise.all(args)),
    } as unknown as PrismaService;
}

describe('TasksService', () => {
    let service: TasksService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: PrismaService, useFactory: prismaMockFactory },
            ],
        }).compile();

        service = module.get(TasksService);
        prisma = module.get(PrismaService);
    });

    describe('findAll', () => {
        it('debe paginar y filtrar por userId', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([
                { id: 1, title: 'A', done: false, userId: 7 },
            ]);
            (prisma.task.count as jest.Mock).mockResolvedValue(1);

            const res = await service.findAll(7, { page: 1, limit: 10 });
            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 7 },
                    orderBy: { id: 'desc' },
                    skip: 0,
                    take: 10,
                })
            );
            expect(res).toEqual({
                items: [{ id: 1, title: 'A', done: false, userId: 7 }],
                total: 1,
                page: 1,
                limit: 10,
            });
        });

        it('aplica search y done correctamente', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.task.count as jest.Mock).mockResolvedValue(0);

            await service.findAll(7, { page: 2, limit: 5, search: 'fea', done: 'true' });

            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: 7,
                        title: { contains: 'fea', mode: 'insensitive' },
                        done: true,
                    },
                    skip: 5, // page 2, limit 5
                    take: 5,
                })
            );
        });

        it('usa where.done=false cuando done="false"', async () => {
            (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.task.count as jest.Mock).mockResolvedValue(0);

            await service.findAll(7, { page: 1, limit: 10, done: 'false' });

            const args = (prisma.task.findMany as jest.Mock).mock.calls[0][0];

            expect(args.where).toMatchObject({ userId: 7, done: false});
            expect(args.skip).toBe(0);
            expect(args.take).toBe(10);
        });
    });

    describe('findOne', () => {
        it('devuelve tarea del usuario', async () => {
            (prisma.task.findFirst as jest.Mock).mockResolvedValue({ id: 3, userId: 7 });
            const t = await service.findOne(3, 7);
            expect(t).toEqual({ id: 3, userId: 7 });
        });

        it('lanza NotFound si no pertenece al usuario', async () => {
            (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);
            await expect(service.findOne(3, 7)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('setea userId en el create', async () => {
            (prisma.task.create as jest.Mock).mockResolvedValue({ id: 10, title: 'X', done: false, userId: 7 });
            const t = await service.createTask({ title: 'X', done: false }, 7);
            expect(prisma.task.create).toHaveBeenCalledWith({
                data: { title: 'X', done: false, userId: 7 },
            });
            expect(t.userId).toBe(7);
        });
    });

    describe('updateTask', () => {
        it('lanza NotFound si updateMany.count === 0', async () => {
            (prisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

            await expect(service.updateTask(1, 7, { done: true }))
                .rejects.toThrow(NotFoundException);

            expect(prisma.task.updateMany).toHaveBeenCalledWith({
                where: { id: 1, userId: 7 },
                data: { done: true },
            });
        });

        it('devuelve la tarea actualizada cuando count === 1', async () => {
            (prisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.task.findUnique as jest.Mock).mockResolvedValue({
                id: 1, title: 'X', done: true, userId: 7,
            });

            const res = await service.updateTask(1, 7, { done: true });

            expect(prisma.task.updateMany).toHaveBeenCalledWith({
                where: { id: 1, userId: 7 },
                data: { done: true },
            });
            expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res).toEqual({ id: 1, title: 'X', done: true, userId: 7 });
        });
    });

    describe('deleteTask', () => {
        it('lanza NotFound si deleteMany.count === 0', async () => {
            (prisma.task.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
            await expect(service.deleteTask(123, 7)).rejects.toThrow(NotFoundException);
            expect(prisma.task.deleteMany).toHaveBeenCalledWith({
                where: { id: 123, userId: 7 },
            });
        });

        it('devuelve mensaje si deleteMany.count === 1', async () => {
            (prisma.task.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            await expect(service.deleteTask(5, 7))
                .resolves.toEqual({ message: 'Tarea eliminada correctamente' });
        });
    });

});
