import { Injectable } from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {PrismaClient} from "@prisma/client";

@Injectable()
export class TasksService {

    private prisma = new PrismaClient();


    async findAll(){
        return this.prisma.task.findMany();
    }

    async findOne(id: number){
        return this.prisma.task.findUnique({where: {id}});
    }

    async createTask(task: CreateTaskDto){
        return this.prisma.task.create({
            data: task,
        });
    }
}
