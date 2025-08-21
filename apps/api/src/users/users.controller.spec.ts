import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        create: jest.fn(),
                        findByEmail: jest.fn(),
                        getAllUsers: jest.fn(),
                    },
                },
                { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
                { provide: AdminGuard, useValue: { canActivate: () => true } },
            ],
        }).compile();

        controller = module.get(UsersController);
        service = module.get(UsersService) as any;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // ejemplo: si tienes /users/admin/get-all
    it('GET admin getAllUsers llama service.getAllUsers', async () => {
        service.getAllUsers.mockResolvedValue([{ id: 1, email: 'a@b.c', role: 'user' } as any]);
        const out = await controller.getAllUsers();
        expect(service.getAllUsers).toHaveBeenCalled();
        expect(out).toHaveLength(1);
    });
});