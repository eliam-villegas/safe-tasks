import {Controller, UsePipes, ValidationPipe, Param, Get, Post, Body, Patch, Delete, UseGuards} from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {TasksService} from "./tasks.service";
import {UpdateTaskDto} from "./update-task.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Get()
    async findAll(){
        return await this.tasksService.findAll();
    }

    @Get(':id')
    async findOne(@Param("id") id:string){
        return await this.tasksService.findOne(Number(id));
    }

    @Post()
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    async create(@Body() task: CreateTaskDto){
        return await this.tasksService.createTask(task);
    }

    @Patch(":id")
    @UsePipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}))
    async update(@Param("id") id:string, @Body() data: UpdateTaskDto){
        return await this.tasksService.updateTask(Number(id),data);
    }

    @Delete(":id")
    async delete(@Param("id") id:string){
        return await this.tasksService.delete(Number(id));

    }

}
