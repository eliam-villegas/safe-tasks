import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService {
    constructor (private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

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

}
