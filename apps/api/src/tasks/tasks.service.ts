import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {PrismaClient, Prisma} from "@prisma/client";
import {UpdateTaskDto} from "./update-task.dto";

@Injectable()
export class TasksService {

    private prisma = new PrismaClient();

    // metodos user
    async findAll(userId:number){
        const task = await this.prisma.task.findMany({
            where: { userId },
        });
        return task
    }

    async findOne(id: number, userId: number){
        const task = await this.prisma.task.findFirst({
            where: {id, userId},
        });
        if(!task){
            throw new NotFoundException("Tarea no encontrada o no tienes permiso.");
        }
        return task;
    }

    async createTask(task: CreateTaskDto, userId: number){
        return this.prisma.task.create({
            data: {
                ...task,
                userId,
            },
        });
    }

    async updateTask(id: number, userId: number, data: UpdateTaskDto){
        try{
            return this.prisma.task.update({
                where: { id, userId },
                data,
            });
        }
        catch (error){
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
                throw new NotFoundException("No se encontró la tarea");
            }
        }
        throw Error;
    }

    async delete(id: number, userId: number){
        try {
            await this.prisma.task.delete({where: {id, userId}});
            return { message: "Tarea eliminada correctamente"}
        }
        catch (error){
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
                throw new NotFoundException("La tarea no existe");
            }
        }
        throw Error;
    }
    //fin metodos user

    //metodos admin

    async findAllTasks(){
        return await this.prisma.task.findMany({
            include: { user: true },
        });
    }

    async deleteAnyTask(id: number){
        return await this.prisma.task.delete({
            where: { id },
        });
    }


}
