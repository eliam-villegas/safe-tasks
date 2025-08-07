import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtModule} from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: "1h"},
            }),
        }),
        UsersModule,
    ],
  providers: [AuthService],
  controllers: [AuthController]
})

export class AuthModule {}
