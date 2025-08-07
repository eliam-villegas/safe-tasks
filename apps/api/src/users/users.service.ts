import {ConflictException, Injectable} from '@nestjs/common';
import {CreateUserDto} from "./create-user.dto";
import {PrismaClient} from "@prisma/client";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {

    private prisma = new PrismaClient();

    async create(userData: CreateUserDto){
        const existing = await this.prisma.user.findUnique({
            where:{email:userData.email},
        });
        if(existing){
            throw new ConflictException("El email ya está registrado");
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
            },
        });

        return {id: user.id, email: userData.email};
    }

    async findByEmail(email: string){
        return await this.prisma.user.findUnique({where: {email}});
    }

}
