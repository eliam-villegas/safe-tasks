import {Controller, Patch, Param, Get, Post, Body, UsePipes, ValidationPipe, UseGuards} from '@nestjs/common';
import {CreateUserDto} from "./create-user.dto"
import {UsersService} from "./users.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AdminGuard} from "../auth/admin.guard"

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post("register")
    @UsePipes(new ValidationPipe({whitelist:true}))
    async register(@Body() userData: CreateUserDto){
        return await this.usersService.create(userData);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get("admin/users")
    async getAllUsers(){
        return await this.usersService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch("admin/users/:id/role")
    async updateUserRole(@Param("id") id:string, @Body() data: {role: string}){
        return await this.usersService.updateUserRole(Number(id), data.role);
    }

}
