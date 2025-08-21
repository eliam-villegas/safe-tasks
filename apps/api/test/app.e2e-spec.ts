import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test as NestTest, TestingModule } from '@nestjs/testing';
import request, { type SuperAgentTest } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('E2E – auth + tasks (happy path)', () => {
    let app: INestApplication;
    let http: SuperAgentTest;
    let prisma: PrismaClient;

    let userToken = '';
    let adminToken = '';
    let createdTaskId: number;

    // Helpers
    const uniqueEmail = (prefix='user') =>
        `${prefix}.${Date.now()}@e2e.test`;

    beforeAll(async () => {
        // Prisma crudo para limpiar BD
        prisma = new PrismaClient();

        // Limpia tablas en orden FK
        await prisma.task.deleteMany({});
        await prisma.user.deleteMany({});

        // Arranca Nest
        const moduleRef: TestingModule = await NestTest.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();

        // Crea cliente supertest contra el servidor embebido
        http = request.agent(app.getHttpServer());
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('REGISTER user -> 201', async () => {
        const res = await http.post('/users/register')
            .send({ email: uniqueEmail('user'), password: 'secret123' })
            .expect(201);

        expect(res.body).toMatchObject({
            id: expect.any(Number),
            email: expect.stringMatching(/@e2e\.test$/),
            role: 'user',
        });
    });

    it('REGISTER admin (luego le forzamos role=admin en DB) -> 201', async () => {
        const email = uniqueEmail('admin');
        const out = await http.post('/users/register')
            .send({ email, password: 'secret123' })
            .expect(201);

        // Elevar a admin directamente en DB de test
        await prisma.user.update({
            where: { id: out.body.id },
            data: { role: 'admin' },
        });
    });

    it('LOGIN user -> 201 + token', async () => {
        // Busca cualquier user no-admin
        const anyUser = await prisma.user.findFirst({ where: { role: 'user' } });
        expect(anyUser).toBeTruthy();

        const res = await http.post('/auth/login')
            .send({ email: anyUser!.email, password: 'secret123' })
            .expect(201);

        userToken = res.body.access_token;
        expect(typeof userToken).toBe('string');
    });

    it('LOGIN admin -> 201 + token', async () => {
        const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
        expect(admin).toBeTruthy();

        const res = await http.post('/auth/login')
            .send({ email: admin!.email, password: 'secret123' })
            .expect(201);

        adminToken = res.body.access_token;
        expect(typeof adminToken).toBe('string');
    });

    it('GET /tasks (vacío al inicio) -> 200 {items, total}', async () => {
        const res = await http.get('/tasks')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(res.body).toMatchObject({
            items: expect.any(Array),
            total: expect.any(Number),
            page: expect.any(Number),
            limit: expect.any(Number),
        });
    });

    it('POST /tasks -> 201 crea una tarea para el user', async () => {
        const res = await http.post('/tasks')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Tarea E2E', done: false })
            .expect(201);

        expect(res.body).toMatchObject({
            id: expect.any(Number),
            title: 'Tarea E2E',
            done: false,
        });
        createdTaskId = res.body.id;
    });

    it('PATCH /tasks/:id -> 200 cambia done=true', async () => {
        const res = await http.patch(`/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ done: true })
            .expect(200);

        expect(res.body).toMatchObject({
            id: createdTaskId,
            done: true,
        });
    });

    it('DELETE /tasks/:id (otro user/admin-only) -> 403 con user', async () => {
        // Crea otra tarea con admin para probar ownership
        const other = await http.post('/tasks')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Admin task', done: false })
            .expect(201);

        // El usuario normal no debería poder borrar la del admin
        await http.delete(`/tasks/${other.body.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(404);
    });

    it('GET /tasks/admin/all-tasks con user -> 403', async () => {
        console.log('userToken en admin/list con user:', userToken);
        await http.get('/tasks/admin/all-tasks')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
    });

    it('GET /tasks/admin/all-tasks con admin -> 200 (incluye user)', async () => {
        const res = await http.get('/tasks/admin/all-tasks')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        // Tu endpoint devuelve un array (sin paginar) con include user
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length) {
            expect(res.body[0]).toHaveProperty('user.email');
        }
    });

    it('DELETE /tasks/:id (propia) -> 200 con user', async () => {
        await http.delete(`/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
    });
});