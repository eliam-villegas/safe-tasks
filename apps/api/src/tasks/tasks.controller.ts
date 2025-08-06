import { Controller, UsePipes, ValidationPipe, Param, Get, Post, Body } from '@nestjs/common';
import {CreateTaskDto} from "./create-task.dto";
import {TasksService} from "./tasks.service";

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

}
