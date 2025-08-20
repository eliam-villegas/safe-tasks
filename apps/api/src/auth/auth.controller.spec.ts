import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let service: jest.Mocked<AuthService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get(AuthController);
        service = module.get(AuthService) as any;
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('POST /auth/login llama al service.login y devuelve token', async () => {
        service.login.mockResolvedValue({ access_token: 'jwt' });
        const out = await controller.login({ email: 'a@b.c', password: 'pw' } as any);
        expect(service.login).toHaveBeenCalledWith('a@b.c', 'pw');
        expect(out).toEqual({ access_token: 'jwt' });
    });
});