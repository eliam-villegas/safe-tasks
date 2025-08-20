import {Controller, Post, UsePipes, Body, Get, Req, UseGuards} from '@nestjs/common';
import {ValidationPipe} from '@nestjs/common';
import {LoginUserDto} from "../users/login-user.dto";
import {AuthService} from "../auth/auth.service";
import {JwtAuthGuard} from "./jwt-auth.guard";
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto} from './dto/forgot-password.dto'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    @UsePipes(new ValidationPipe({whitelist: true}))
    async login(@Body() loginData: LoginUserDto) {
        return await this.authService.login(loginData.email, loginData.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@Req() req: any){
        return req.user;
    }

    @Post("forgot-password")
    @UsePipes(new ValidationPipe({whitelist: true}))
    async forgotPassword(@Body() dto: ForgotPasswordDto){
        return this.authService.requestPasswordReset(dto.email);
    }

    @Post('reset-password')
    @UsePipes(new ValidationPipe({whitelist: true}))
    async resetPassword(@Body() dto: ResetPasswordDto){
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

}