import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {PrismaClient, Prisma} from "@prisma/client";

import {UpdateTaskDto} from "./update-task.dto";

@Injectable()
export class TasksService {

    private prisma = new PrismaClient();


    async findAll(){
        const task = await this.prisma.task.findMany();
        return task
    }

    async findOne(id: number){
        const task = await this.prisma.task.findUnique({where: {id}});
        if(!task){
            throw new NotFoundException("Tarea no encontrada o no existe.");
        }
        return task;
    }

    async createTask(task: CreateTaskDto){
        return this.prisma.task.create({
            data: task,
        });
    }

    async updateTask(id: number, data: UpdateTaskDto){
        try{
            return await this.prisma.task.update({
                where: { id },
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

    async delete(id: number){
        try {
            await this.prisma.task.delete({where: {id}});
            return { message: "Tarea eliminada correctamente"}
        }
        catch (error){
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
                throw new NotFoundException("La tarea no existe");
            }
        }
        throw Error;
    }
}
