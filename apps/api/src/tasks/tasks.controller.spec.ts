import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

describe('TasksController', () => {
    let controller: TasksController;
    let service: jest.Mocked<TasksService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        createTask: jest.fn(),
                        updateTask: jest.fn(),
                        deleteTask: jest.fn(),
                        // admin endpoints:
                        findAllTasks: jest.fn(),
                        deleteAnyTask: jest.fn(),
                    },
                },
                // Mocks de guards usados por @UseGuards(...)
                { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
                { provide: AdminGuard, useValue: { canActivate: () => true } },
            ],
        }).compile();

        controller = module.get(TasksController);
        service = module.get(TasksService) as any;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // Ejemplo rápido de prueba de endpoint:
    it('GET /tasks llama al service.findAll con userId', async () => {
        service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });

        const req: any = { user: { sub: 123 } };
        const q = {} as any; // o {} as unknown as ListTasksDto

        const out = await controller.findAll(q, req);

        expect(service.findAll).toHaveBeenCalledWith(123, q);
        expect(out).toEqual({ items: [], total: 0, page: 1, limit: 10 });
    });
});