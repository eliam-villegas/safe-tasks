import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private resend: Resend;

    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        const apiKey = this.config.get<string>('RESEND_API_KEY');
        this.resend = new Resend(apiKey);
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        return { access_token: token };
    }

    // 1) Solicitar reseteo: genera token y guarda hash
    async requestPasswordReset(email: string) {
        const user = await this.usersService.findByEmail(email);

        // Siempre respondemos OK para no filtrar existencia de cuentas
        if (!user) return { ok: true };

        // limpiar tokens previos no usados
        await this.prisma.passwordReset.deleteMany({
            where: { userId: user.id, usedAt: null },
        });

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

        await this.prisma.passwordReset.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });

        const webBase =
            this.config.get<string>('FRONT_URL') ??
            this.config.get<string>('NEXT_PUBLIC_SITE_URL') ??
            'http://localhost:3000';

        const resetLink = `${webBase}/reset?token=${rawToken}`;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.config.get<string>('RESET_EMAIL_FROM') ?? 'SafeTasks <onboarding@resend.dev>',
                to: email,
                subject: 'Recuperación de contraseña',
                html: `
          <h1>Recuperar tu contraseña</h1>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <p><a href="${resetLink}" target="_blank" rel="noreferrer">${resetLink}</a></p>
          <p>Este enlace expira en 15 minutos.</p>
        `,
            });

            if (error) {
                console.error('[Resend error]', error);
                return { ok: false, error: String((error as any)?.message ?? error) };
            }

            // En dev es útil exponer el link
            const extra =
                this.config.get<string>('NODE_ENV') !== 'production' ? { resetLink } : {};
            return { ok: true, ...extra };
        } catch (e: any) {
            console.error('[Resend exception]', e);
            return { ok: false, error: e?.message ?? 'send failed' };
        }
    }

    // 2) Resetear: validar token, expira, marcar usado y cambiar contraseña
    async resetPassword(rawToken: string, newPassword: string) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const record = await this.prisma.passwordReset.findUnique({
            where: { tokenHash },
        });

        if (!record || record.usedAt || record.expiresAt < new Date()) {
            throw new UnauthorizedException('Token inválido o expirado');
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { password: hashed },
            }),
            this.prisma.passwordReset.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.passwordReset.deleteMany({
                where: { userId: record.userId, usedAt: null, id: { not: record.id } },
            }),
        ]);

        return { ok: true };
    }
}