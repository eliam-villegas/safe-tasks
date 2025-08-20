import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto'
import {UsersService} from "../users/users.service";
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor (private readonly jwtService: JwtService, private readonly usersService: UsersService, private readonly prisma: PrismaService) {}

    async login (email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const payload = { sub: user.id, email: user.email, role: user.role}
        const token = this.jwtService.sign(payload);

        return {access_token: token}
    }
    // 1) Solicitar reseteo: genera token y guarda hash
    async requestPasswordReset(email: string){
        const user = await this.usersService.findByEmail(email);

        if (!user) return { ok: true}

        await this.prisma.passwordReset.deleteMany({
            where: {
                userId: user.id,
                usedAt: null,
            },
        });

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            },
        });

        const resetLink = `${process.env.FRONT_URL ?? 'http://localhost:3000'}/reset?token=${rawToken}`;
        return { ok: true, resetLink};
    }

    // 2) Resetear: validar token, expira, marcar usado y cambiar contraseña
    async resetPassword(rawToken: string, newPassword: string) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const record = await this.prisma.passwordReset.findUnique({ where: { tokenHash } });
        if (!record || record.usedAt || record.expiresAt < new Date()) {
            throw new UnauthorizedException('Token inválido o expirado');
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
            this.prisma.passwordReset.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.passwordReset.deleteMany({ // limpia otros tokens activos
                where: { userId: record.userId, usedAt: null, id: { not: record.id } },
            }),
        ]);

        return { ok: true };
    }

}
