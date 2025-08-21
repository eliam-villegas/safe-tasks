import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
    let service: AuthService;
    let users: jest.Mocked<UsersService>;
    let jwt: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findByEmail: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(AuthService);
        users = module.get(UsersService) as any;
        jwt = module.get(JwtService) as any;

        expect(typeof jwt.sign).toBe('function');

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('retorna access_token cuando credenciales válidas', async () => {
            const email = 'a@b.c';
            const password = 'secret123';
            const hashed = await bcrypt.hash(password, 10);

            users.findByEmail.mockResolvedValue({
                id: 1,
                email,
                password: hashed,
                role: 'user',
            } as any);

            jwt.sign.mockReturnValue('signed.jwt');

            const out = await service.login(email, password);

            expect(users.findByEmail).toHaveBeenCalledWith(email);

            expect(jwt.sign).toHaveBeenCalledWith({ sub: 1, email, role: 'user' });
            expect(out).toEqual({ access_token: 'signed.jwt' });
        });

        it('lanza si password inválido', async () => {
            const email = 'a@b.c';
            users.findByEmail.mockResolvedValue({
                id: 1,
                email,
                password: await bcrypt.hash('otra', 10),
                role: 'user',
            } as any);

            await expect(service.login(email, 'secret123')).rejects.toThrow();
        });

        it('lanza si usuario no existe', async () => {
            users.findByEmail.mockResolvedValue(null);
            await expect(service.login('x@y.z', 'pw')).rejects.toThrow();
        });
    });
});