import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {CreateTaskDto} from "./dto/create-task.dto";
import {PrismaClient, Prisma} from "@prisma/client";
import {UpdateTaskDto} from "./dto/update-task.dto";
import {ListTasksDto} from "./dto/list-task.dto";

@Injectable()
export class TasksService {

    private prisma = new PrismaClient();

    // metodos user
    async findAll(userId: number, q: ListTasksDto){
        if (!userId) throw new UnauthorizedException("Token invalido");
        const { page = 1, limit = 10, search, done } = q;
        const where: any = { userId };
        if (search) {
            where.title = { contains: search, mode: "insensitive" };
        }
        if (done === "true" || done === "false") {
            where.done = (done === "true");
        }

        const skip = (page - 1) * limit;
        const take = limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.task.findMany({
                where,
                orderBy: { id: "desc" },
                skip,
                take,
                select: {
                    id: true,
                    title: true,
                    done: true,
                },
            }),
            this.prisma.task.count({ where }),
        ]);

        return { items, total, page, limit };

    }

    async findOne(id: number, userId: number){
        if (!userId) throw new UnauthorizedException("Token invalido");
        const task = await this.prisma.task.findFirst({
            where: {id, userId},
        });
        if(!task){
            throw new NotFoundException("Tarea no encontrada o no tienes permiso.");
        }
        return task;
    }

    async createTask(task: CreateTaskDto, userId: number){
        if (!userId) throw new UnauthorizedException("Token invalido");
        return this.prisma.task.create({
            data: {
                ...task,
                userId,
            },
        });
    }

    async updateTask(id: number, userId: number, data: UpdateTaskDto){
        if (!userId) throw new UnauthorizedException("Token invalido");
        const result = await this.prisma.task.updateMany({
            where: { id, userId },
            data,
        });

        if (result.count === 0) {
            throw new NotFoundException("Tarea no encontrada");
        }

        return this.prisma.task.findUnique({
            where: { id },
        });
    }

    async deleteTask(id: number, userId: number){
        if (!userId) throw new UnauthorizedException("Token invalido");
        const result = await this.prisma.task.deleteMany({
            where: { id, userId },
        });

        if (result.count === 0) {
            throw new NotFoundException("Tarea no encontrada");
        }
        return { message: "Tarea eliminada correctamente"};
    }
    //fin metodos user

    //metodos admin

    async findAllTasks(){
        return await this.prisma.task.findMany({
            select: { id: true, title: true, done:true, user: { select: { id: true, email: true, role: true } } },
        });
    }

    async deleteAnyTask(id: number){
        return await this.prisma.task.delete({
            where: { id },
        });
    }

    async updateAny(id: number, data: UpdateTaskDto){
        return this.prisma.task.update({
            where: { id },
            data
        });
    }


}
