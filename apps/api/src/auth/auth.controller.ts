import {Controller, Post, UsePipes, Body, Get, Req, UseGuards} from '@nestjs/common';
import {ValidationPipe} from '@nestjs/common';
import {LoginUserDto} from "../users/login-user.dto";
import {AuthService} from "../auth/auth.service";
import {JwtAuthGuard} from "./jwt-auth.guard";

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

}