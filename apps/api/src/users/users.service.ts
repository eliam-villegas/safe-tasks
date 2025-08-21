import {ConflictException, Injectable} from '@nestjs/common';
import {CreateUserDto} from "./create-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) {}

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

        return {id: user.id, email: userData.email, role: user.role};
    }

    async findByEmail(email: string){
        return await this.prisma.user.findUnique({where: {email}});
    }

    async getAllUsers(){
        return await this.prisma.user.findMany({
            select: { id: true, email: true, role: true},
        });
    }

    async updateUserRole(id: number, role: string){
        return await this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }

}
