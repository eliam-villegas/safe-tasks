import {Controller, Post, UsePipes, Body} from '@nestjs/common';
import {ValidationPipe} from '@nestjs/common';
import {LoginUserDto} from "../users/login-user.dto";
import {AuthService} from "../auth/auth.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    @UsePipes(new ValidationPipe({whitelist: true}))
    async login(@Body() loginData: LoginUserDto) {
        return await this.authService.login(loginData.email, loginData.password);
    }

}