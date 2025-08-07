import {Controller, Post, Body, UsePipes, ValidationPipe} from '@nestjs/common';
import {CreateUserDto} from "./create-user.dto"
import {UsersService} from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post("register")
    @UsePipes(new ValidationPipe({whitelist:true}))
    async register(@Body() userData: CreateUserDto){
        return await this.usersService.create(userData);
    }

}
